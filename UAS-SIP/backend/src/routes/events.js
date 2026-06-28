const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { status, search } = req.query;
  try {
    let sql = `
      SELECT e.*,
      (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id) as ticket_types
      FROM events e
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    } else {
      sql += ' AND e.status = "active"';
    }

    if (search) {
      sql += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY e.event_date ASC';

    const events = db.query(sql, params);
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const event = db.queryOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event tidak ditemukan' });
    }
    const tickets = db.query('SELECT * FROM tickets WHERE event_id = ?', [id]);
    res.status(200).json({ event, tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { title, description, location, event_date, total_quota, tickets } = req.body;
  if (!title || !location || !event_date || !total_quota || !tickets || !Array.isArray(tickets)) {
    return res.status(400).json({ error: 'Data event tidak lengkap atau tickets invalid' });
  }

  const eventId = uuidv4();
  try {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO events (id, title, description, location, event_date, total_quota, remaining_quota, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))`,
      [eventId, title, description || '', location, event_date, total_quota, total_quota]
    );

    const insertedTickets = [];
    for (const ticket of tickets) {
      const ticketId = uuidv4();
      db.run(
        `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ticketId, eventId, ticket.type, ticket.price, ticket.quota, ticket.quota]
      );
      insertedTickets.push({
        id: ticketId,
        event_id: eventId,
        type: ticket.type,
        price: ticket.price,
        quota: ticket.quota,
        remaining: ticket.quota
      });
    }

    db.run('COMMIT');

    const event = db.queryOne('SELECT * FROM events WHERE id = ?', [eventId]);

    res.status(201).json({
      message: 'Event berhasil dibuat',
      event,
      tickets: insertedTickets
    });
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (_) {}
    res.status(500).json({ error: 'Gagal membuat event: ' + error.message });
  }
});

router.patch('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, description, location, event_date, total_quota, status } = req.body;

  try {
    const event = db.queryOne('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event tidak ditemukan' });
    }

    const newTitle = title !== undefined ? title : event.title;
    const newDesc = description !== undefined ? description : event.description;
    const newLoc = location !== undefined ? location : event.location;
    const newDate = event_date !== undefined ? event_date : event.event_date;
    const newStatus = status !== undefined ? status : event.status;

    let newQuota = event.total_quota;
    let newRemaining = event.remaining_quota;

    if (total_quota !== undefined) {
      const diff = total_quota - event.total_quota;
      newQuota = total_quota;
      newRemaining = event.remaining_quota + diff;
      if (newRemaining < 0) {
        return res.status(400).json({ error: 'Kuota baru tidak boleh kurang dari tiket yang sudah terjual' });
      }
    }

    db.run(
      `UPDATE events
       SET title = ?, description = ?, location = ?, event_date = ?, total_quota = ?, remaining_quota = ?, status = ?
       WHERE id = ?`,
      [newTitle, newDesc, newLoc, newDate, newQuota, newRemaining, newStatus, id]
    );

    const updatedEvent = db.queryOne('SELECT * FROM events WHERE id = ?', [id]);
    res.status(200).json({
      message: 'Event berhasil diperbarui',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui event: ' + error.message });
  }
});

module.exports = router;
