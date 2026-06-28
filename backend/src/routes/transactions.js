const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('../lib/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { ticket_id, quantity, payment_method } = req.body;
  const userId = req.user.id;

  if (!ticket_id || !quantity || !payment_method) {
    return res.status(400).json({ error: 'ticket_id, quantity, dan payment_method wajib diisi' });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1 || qty > 5) {
    return res.status(400).json({ error: 'Quantity harus berupa angka antara 1 sampai 5' });
  }

  const validMethods = ['qris', 'gopay', 'ovo', 'dana', 'transfer_bca', 'transfer_mandiri'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ error: 'Metode pembayaran tidak valid' });
  }

  try {
    db.run('BEGIN TRANSACTION');

    const ticket = db.queryOne('SELECT * FROM tickets WHERE id = ?', [ticket_id]);
    if (!ticket) {
      db.run('ROLLBACK');
      return res.status(404).json({ error: 'Tipe tiket tidak ditemukan' });
    }

    const event = db.queryOne('SELECT * FROM events WHERE id = ?', [ticket.event_id]);
    if (!event) {
      db.run('ROLLBACK');
      return res.status(404).json({ error: 'Event tidak ditemukan' });
    }

    if (event.status !== 'active') {
      db.run('ROLLBACK');
      return res.status(409).json({ error: 'Event sudah tidak aktif' });
    }

    if (ticket.remaining < qty) {
      db.run('ROLLBACK');
      return res.status(409).json({ error: 'Kuota tiket tidak mencukupi' });
    }

    // Update remaining quota
    db.run('UPDATE tickets SET remaining = remaining - ? WHERE id = ?', [qty, ticket_id]);
    db.run('UPDATE events SET remaining_quota = remaining_quota - ? WHERE id = ?', [qty, ticket.event_id]);

    const transactionId = uuidv4();
    const totalPrice = ticket.price * qty;

    db.run(
      `INSERT INTO transactions (id, user_id, ticket_id, quantity, total_price, payment_method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [transactionId, userId, ticket_id, qty, totalPrice, payment_method]
    );

    db.run('COMMIT');

    const payment_instructions = `Buka ${payment_method.toUpperCase()} → bayar ke TiketInAja sebesar Rp${totalPrice.toLocaleString('id-ID')}`;

    res.status(201).json({
      message: 'Pesanan dibuat. Lanjutkan ke pembayaran.',
      transaction_id: transactionId,
      total_price: totalPrice,
      payment_method,
      payment_instructions
    });
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (_) {}
    res.status(500).json({ error: 'Gagal membuat pesanan: ' + error.message });
  }
});

router.post('/:id/pay', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const trx = db.queryOne('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!trx) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    if (trx.status === 'paid') {
      return res.status(409).json({ error: 'Transaksi sudah dibayar sebelumnya' });
    }

    // Mock payment delay (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    db.run('BEGIN TRANSACTION');

    const timestamp = Date.now();
    const qrToken = `EVENIN-${id}-${timestamp}`;
    const qrCodeId = uuidv4();

    db.run('UPDATE transactions SET status = "paid", paid_at = datetime("now") WHERE id = ?', [id]);
    db.run('INSERT INTO qr_codes (id, transaction_id, qr_token, is_used) VALUES (?, ?, ?, 0)', [qrCodeId, id, qrToken]);

    db.run('COMMIT');

    const qrImage = await QRCode.toDataURL(qrToken);

    res.status(200).json({
      message: 'Pembayaran berhasil',
      qr_token: qrToken,
      qr_image: qrImage,
      transaction_id: id
    });
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (_) {}
    res.status(500).json({ error: 'Gagal memproses pembayaran: ' + error.message });
  }
});

router.get('/my', authMiddleware, (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = db.query(
      `SELECT t.id, t.quantity, t.total_price, t.payment_method, t.status, t.paid_at, t.created_at,
              tk.type as ticket_type, tk.price as ticket_price,
              e.title as event_title, e.location as event_location, e.event_date,
              q.qr_token, q.is_used, q.scanned_at
       FROM transactions t
       JOIN tickets tk ON t.ticket_id = tk.id
       JOIN events e ON tk.event_id = e.id
       LEFT JOIN qr_codes q ON t.id = q.transaction_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const trx = db.queryOne(
      `SELECT t.*,
              tk.type as ticket_type, tk.price as ticket_price, tk.event_id,
              e.title as event_title, e.location as event_location, e.event_date,
              q.qr_token, q.is_used, q.scanned_at
       FROM transactions t
       JOIN tickets tk ON t.ticket_id = tk.id
       JOIN events e ON tk.event_id = e.id
       LEFT JOIN qr_codes q ON t.id = q.transaction_id
       WHERE t.id = ?`,
      [id]
    );

    if (!trx) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    if (trx.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    let qrImage = null;
    if (trx.status === 'paid' && trx.qr_token) {
      qrImage = await QRCode.toDataURL(trx.qr_token);
    } else if (trx.status === 'pending') {
      const paymentToken = `PAYMENT-SIM-${trx.payment_method.toUpperCase()}-${trx.id}`;
      qrImage = await QRCode.toDataURL(paymentToken);
    }

    res.status(200).json({
      transaction: {
        ...trx,
        qr_image: qrImage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scan', authMiddleware, adminMiddleware, (req, res) => {
  const { qr_token } = req.body;
  if (!qr_token) {
    return res.status(400).json({ error: 'qr_token wajib diisi' });
  }

  try {
    const qrCode = db.queryOne('SELECT * FROM qr_codes WHERE qr_token = ?', [qr_token]);
    if (!qrCode) {
      return res.status(404).json({
        valid: false,
        error: 'QR tidak valid'
      });
    }

    if (qrCode.is_used === 1) {
      return res.status(409).json({
        valid: false,
        error: 'Tiket sudah digunakan',
        scanned_at: qrCode.scanned_at
      });
    }

    db.run('UPDATE qr_codes SET is_used = 1, scanned_at = datetime("now") WHERE id = ?', [qrCode.id]);

    const info = db.queryOne(
      `SELECT e.title as event_title, tk.type as ticket_type, t.quantity, u.name as user_name, u.email as user_email
       FROM qr_codes q
       JOIN transactions t ON q.transaction_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN tickets tk ON t.ticket_id = tk.id
       JOIN events e ON tk.event_id = e.id
       WHERE q.id = ?`,
      [qrCode.id]
    );

    res.status(200).json({
      valid: true,
      message: 'Tiket valid — silakan masuk',
      ticket_info: info
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
