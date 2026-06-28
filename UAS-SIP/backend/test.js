const assert = require('assert');
const db = require('./src/lib/db');

async function runTests() {
  console.log('Menjalankan tes internal...');
  await db.initDb();

  // Bersihkan data tes
  db.run('DELETE FROM users WHERE id = "test-user-id"');
  db.run('DELETE FROM events WHERE id = "test-event-id"');

  // Tes 1: Insert & Select User
  db.run(
    `INSERT INTO users (id, name, email, password_hash, role, created_at)
     VALUES ("test-user-id", "Test User", "test@mail.com", "hash", "user", datetime("now"))`
  );
  const user = db.queryOne('SELECT * FROM users WHERE id = ?', ['test-user-id']);
  assert.ok(user, 'User harus berhasil di-insert');
  assert.strictEqual(user.name, 'Test User', 'Nama user harus sesuai');

  // Tes 2: Insert & Select Event
  db.run(
    `INSERT INTO events (id, title, description, location, event_date, total_quota, remaining_quota, status, created_at)
     VALUES ("test-event-id", "Test Event", "Desc", "Lab", "2026-08-10 10:00", 10, 10, "active", datetime("now"))`
  );
  const event = db.queryOne('SELECT * FROM events WHERE id = ?', ['test-event-id']);
  assert.ok(event, 'Event harus berhasil di-insert');
  assert.strictEqual(event.title, 'Test Event', 'Judul event harus sesuai');

  // Bersihkan kembali
  db.run('DELETE FROM users WHERE id = "test-user-id"');
  db.run('DELETE FROM events WHERE id = "test-event-id"');

  console.log('Semua tes internal berhasil lolos!');
}

runTests().catch((err) => {
  console.error('Tes gagal:', err);
  process.exit(1);
});
