const pool = require('./db.js');
async function run() {
  try {
    await pool.query('ALTER TABLE intern_submissions ADD UNIQUE KEY intern_project (intern_id, project_id);');
    console.log('Done');
  } catch(e) {
    console.log(e.message);
  }
  process.exit();
}
run();
