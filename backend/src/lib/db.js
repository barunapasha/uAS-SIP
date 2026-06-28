const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const originalDbPath = path.join(__dirname, '../../evenin.db');
const dbPath = isVercel ? '/tmp/evenin.db' : originalDbPath;

let db = null;
let inTransaction = false;

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      event_date TEXT NOT NULL,
      total_quota INTEGER NOT NULL,
      remaining_quota INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      quota INTEGER NOT NULL,
      remaining INTEGER NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      ticket_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      qr_token TEXT UNIQUE NOT NULL,
      is_used INTEGER DEFAULT 0,
      scanned_at TEXT,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
  `);
}

async function initDb() {
  if (db) return db;

  if (isVercel) {
    if (!fs.existsSync(dbPath) && fs.existsSync(originalDbPath)) {
      fs.copyFileSync(originalDbPath, dbPath);
    }
  }

  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '../../node_modules/sql.js/dist', file)
  });
  const dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
    createTables();
    persist();
  }
  return db;
}

function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function query(sql, params = []) {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");

  const sqlUpper = sql.trim().toUpperCase();
  if (sqlUpper.startsWith('BEGIN')) {
    inTransaction = true;
  }

  db.run(sql, params);

  if (sqlUpper.startsWith('COMMIT') || sqlUpper.startsWith('ROLLBACK')) {
    inTransaction = false;
  }

  if (!inTransaction) {
    persist();
  }

  return {
    changes: db.getRowsModified()
  };
}

function cancelExpiredTransactions() {
  if (!db || inTransaction) return;

  const expired = query(
    `SELECT t.id, t.ticket_id, t.quantity, tk.event_id
     FROM transactions t
     JOIN tickets tk ON t.ticket_id = tk.id
     WHERE t.status = 'pending'
       AND datetime(t.created_at, '+15 minutes') < datetime('now')`
  );

  if (expired.length === 0) return;

  try {
    inTransaction = true;
    db.run('BEGIN TRANSACTION');

    for (const trx of expired) {
      db.run("UPDATE transactions SET status = 'cancelled' WHERE id = ?", [trx.id]);
      db.run("UPDATE tickets SET remaining = remaining + ? WHERE id = ?", [trx.quantity, trx.ticket_id]);
      db.run("UPDATE events SET remaining_quota = remaining_quota + ? WHERE id = ?", [trx.quantity, trx.event_id]);
    }

    db.run('COMMIT');
    inTransaction = false;
    persist();
    console.log(`Auto-cancelled ${expired.length} expired transactions.`);
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (_) {}
    inTransaction = false;
    console.error('Failed to auto-cancel expired transactions:', error);
  }
}

module.exports = {
  initDb,
  query,
  queryOne,
  run,
  persist,
  cancelExpiredTransactions
};
