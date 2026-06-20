const mysql = require('mysql2/promise'); require('dotenv').config(); 
async function test() { 
  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }); 
  
  const [interns] = await pool.query('SELECT domain FROM internships WHERE id = ?', [2]); 
  const domain = interns[0]?.domain ? interns[0].domain.trim() : ''; 
  const [projects] = await pool.query(
    "SELECT p.*, s.status as submission_status, s.submission_url, s.github_url FROM intern_projects p LEFT JOIN intern_submissions s ON p.id = s.project_id AND s.intern_id = ? WHERE LOWER(p.target_audience) LIKE LOWER(?) OR p.target_audience = 'All' ORDER BY p.created_at DESC", 
    [2, '%' + domain + '%']
  ); 
  console.log('Projects for ID 2 (Data Science):', projects); 
  
  const [interns1] = await pool.query('SELECT domain FROM internships WHERE id = ?', [1]); 
  const domain1 = interns1[0]?.domain ? interns1[0].domain.trim() : ''; 
  const [projects1] = await pool.query(
    "SELECT p.*, s.status as submission_status, s.submission_url, s.github_url FROM intern_projects p LEFT JOIN intern_submissions s ON p.id = s.project_id AND s.intern_id = ? WHERE LOWER(p.target_audience) LIKE LOWER(?) OR p.target_audience = 'All' ORDER BY p.created_at DESC", 
    [1, '%' + domain1 + '%']
  ); 
  console.log('Projects for ID 1 (Full Stack):', projects1); 
  process.exit(); 
} 
test();
