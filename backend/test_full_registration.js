const pool = require('./db');
const axios = require('axios');

async function runTest() {
  try {
    const testEmail = `testca_${Date.now()}@gmail.com`;
    const regPayload = {
      name: 'Test CA Student',
      email: testEmail,
      password: 'password123',
      phone: '9876543210',
      college_name: 'Delhi Technological University',
      instagram_url: 'https://instagram.com/test_ca_student',
      linkedin_url: 'https://linkedin.com/in/test_ca_student'
    };

    console.log('Testing registration with payload:', regPayload);
    const [res] = await pool.query(
      "INSERT INTO campus_ambassadors (name, email, password, phone, college_name, referral_code, instagram_url, linkedin_url, verification_status) VALUES (?, ?, 'pass', ?, ?, 'CA-TEST12', ?, ?, 'Pending')",
      [regPayload.name, regPayload.email, regPayload.phone, regPayload.college_name, regPayload.instagram_url, regPayload.linkedin_url]
    );

    console.log('Inserted CA ID:', res.insertId);

    const [adminView] = await pool.query(
      'SELECT id, name, email, phone, college_name, instagram_url, linkedin_url, verification_status FROM campus_ambassadors WHERE id = ?',
      [res.insertId]
    );

    console.log('Admin query result for newly registered CA:');
    console.log(JSON.stringify(adminView[0], null, 2));
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    process.exit();
  }
}

runTest();
