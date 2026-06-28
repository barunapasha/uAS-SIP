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

// Auto-cancel expired transactions middleware
app.use((req, res, next) => {
  try {
    db.cancelExpiredTransactions();
  } catch (err) {
    console.error('Error auto-cancelling transactions:', err);
  }
  next();
});

// Mount routes for both local (/api) and Vercel (/_/backend/api) paths
app.use(['/api/auth', '/_/backend/api/auth'], authRoutes);
app.use(['/api/events', '/_/backend/api/events'], eventRoutes);
app.use(['/api/transactions', '/_/backend/api/transactions'], transactionRoutes);

// Base route
app.get(['/', '/_/backend'], (req, res) => {
  res.json({ message: 'Welcome to TiketInAja API' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server!' });
});

// Initialize database asynchronously
db.initDb()
  .then(() => {
    console.log('Koneksi database berhasil.');

    // Only listen if not running on Vercel
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error('Gagal memulai database:', error);
  });

// Export the Express app for Vercel Serverless
module.exports = app;
