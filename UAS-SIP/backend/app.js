const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./src/lib/db');

dotenv.config();

const authRoutes = require('./src/routes/auth');
const eventRoutes = require('./src/routes/events');
const transactionRoutes = require('./src/routes/transactions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EventIn API' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server!' });
});

async function startServer() {
  try {
    await db.initDb();
    console.log('Koneksi database berhasil.');

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Gagal memulai server:', error);
    process.exit(1);
  }
}

startServer();
