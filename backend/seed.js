const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/lib/db');

async function seed() {
  console.log('Memulai seeding database...');
  await db.initDb();

  try {
    db.run('BEGIN TRANSACTION');

    // Clean up
    db.run('DELETE FROM qr_codes');
    db.run('DELETE FROM transactions');
    db.run('DELETE FROM tickets');
    db.run('DELETE FROM events');
    db.run('DELETE FROM users');

    // 1. Users
    const saltAdmin = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', saltAdmin);
    const adminId = uuidv4();
    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES (?, 'Admin EvenIn', 'admin@evenin.id', ?, 'admin', datetime('now'))`,
      [adminId, adminHash]
    );

    const saltUser = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('user123', saltUser);
    const userId = uuidv4();
    db.run(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES (?, 'Budi Santoso', 'budi@mail.com', ?, 'user', datetime('now'))`,
      [userId, userHash]
    );

    // 2. Events & Tickets
    // Event 1
    const event1Id = uuidv4();
    db.run(
      `INSERT INTO events (id, title, description, location, event_date, total_quota, remaining_quota, status, created_at)
       VALUES (?, 'Tech Talk: AI & Future of Work', 'Diskusi panel tentang perkembangan AI di dunia kerja.', 'Aula Rektorat Kampus A', '2026-08-10 09:00', 200, 200, 'active', datetime('now'))`,
      [event1Id]
    );

    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'regular', 0, 150, 150)`,
      [uuidv4(), event1Id]
    );
    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'vip', 50000, 50, 50)`,
      [uuidv4(), event1Id]
    );

    // Event 2
    const event2Id = uuidv4();
    db.run(
      `INSERT INTO events (id, title, description, location, event_date, total_quota, remaining_quota, status, created_at)
       VALUES (?, 'Workshop UI/UX Design', 'Belajar Figma dari dasar sampai layouting.', 'Lab Komputer Lantai 2', '2026-09-15 10:00', 50, 50, 'active', datetime('now'))`,
      [event2Id]
    );

    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'reguler', 30000, 40, 40)`,
      [uuidv4(), event2Id]
    );
    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'mahasiswa', 15000, 10, 10)`,
      [uuidv4(), event2Id]
    );

    // Event 3
    const event3Id = uuidv4();
    db.run(
      `INSERT INTO events (id, title, description, location, event_date, total_quota, remaining_quota, status, created_at)
       VALUES (?, 'Music Festival: Kampus Fest', 'Konser musik mahasiswa dengan bintang tamu nasional.', 'Lapangan Utama Kampus B', '2026-10-05 16:00', 1000, 1000, 'active', datetime('now'))`,
      [event3Id]
    );

    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'presale-1', 75000, 300, 300)`,
      [uuidv4(), event3Id]
    );
    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'presale-2', 95000, 500, 500)`,
      [uuidv4(), event3Id]
    );
    db.run(
      `INSERT INTO tickets (id, event_id, type, price, quota, remaining)
       VALUES (?, ?, 'vip-access', 200000, 200, 200)`,
      [uuidv4(), event3Id]
    );

    db.run('COMMIT');
    console.log('Seeding selesai sukses!');
  } catch (error) {
    try { db.run('ROLLBACK'); } catch (_) {}
    console.error('Seeding gagal:', error);
  }
}

seed();
