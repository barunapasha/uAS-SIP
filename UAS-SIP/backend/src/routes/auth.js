const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../lib/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'evenin-super-secret-ganti-di-production';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }

  try {
    const existingUser = db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    db.run(
      'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [id, name, email, passwordHash, 'user']
    );

    const token = jwt.sign({ id, email, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: { id, name, email, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  try {
    const user = db.queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.queryOne('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + error.message });
  }
});

module.exports = router;
