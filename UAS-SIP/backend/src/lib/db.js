const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbPath = path.join(__dirname, '../../evenin.db');
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
  const SQL = await initSqlJs();
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

module.exports = {
  initDb,
  query,
  queryOne,
  run,
  persist
};
