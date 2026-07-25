const pool = require('./db');

async function check() {
  try {
    console.log('Running db schema migrations...');
    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN instagram_url VARCHAR(255)'); console.log('Added instagram_url column'); } catch(e) { console.log('instagram_url column check:', e.message); }
    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN linkedin_url VARCHAR(255)'); console.log('Added linkedin_url column'); } catch(e) { console.log('linkedin_url column check:', e.message); }
    try { await pool.query("ALTER TABLE campus_ambassadors ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending'"); console.log('Added verification_status column'); } catch(e) { console.log('verification_status column check:', e.message); }

    const [rows] = await pool.query('SELECT id, name, email, phone, instagram_url, linkedin_url, verification_status FROM campus_ambassadors');
    console.log('Campus Ambassadors in DB:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

check();
