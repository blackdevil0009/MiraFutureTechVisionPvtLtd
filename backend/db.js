const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const dbName = process.env.DB_NAME || 'mira_admin_db';

const pool = mysql.createPool({
  ...dbConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30' // Force IST for MySQL dates
});

const initDb = async () => {
  try {
    // Connect without database to ensure it exists
    const tempConnection = await mysql.createConnection(dbConfig);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();


    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campus_ambassadors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        college_name VARCHAR(255) NOT NULL,
        referral_code VARCHAR(50) NOT NULL UNIQUE,
        referrals_count INT DEFAULT 0,
        points INT DEFAULT 0,
        instagram_url VARCHAR(255),
        linkedin_url VARCHAR(255),
        upi_id VARCHAR(255),
        verification_status VARCHAR(50) DEFAULT 'Pending',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN points INT DEFAULT 0'); } catch(e) {}
    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN instagram_url VARCHAR(255)'); } catch(e) {}
    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN linkedin_url VARCHAR(255)'); } catch(e) {}
    try { await pool.query('ALTER TABLE campus_ambassadors ADD COLUMN upi_id VARCHAR(255)'); } catch(e) {}
    try { await pool.query("ALTER TABLE campus_ambassadors ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending'"); } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campus_challenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        points INT DEFAULT 100,
        description TEXT,
        deadline VARCHAR(100),
        reward_perk VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campus_challenge_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ambassador_id INT NOT NULL,
        challenge_id INT NOT NULL,
        proof_url TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert initial default campus ambassador challenges if empty
    const [existingChallenges] = await pool.query('SELECT COUNT(*) as count FROM campus_challenges');
    if (existingChallenges[0]?.count === 0) {
      await pool.query(`
        INSERT INTO campus_challenges (title, category, points, description, deadline, reward_perk) VALUES
        ('Solve 10 DSA Array & Tree Problems', 'DSA', 300, 'Solve 10 Data Structures & Algorithms problems on LeetCode / GeeksforGeeks and share your profile link as proof.', '2026-08-20', '300 PTS + DSA Master Certificate'),
        ('Complete General Aptitude Quiz', 'Aptitude', 200, 'Test your logical reasoning and numerical aptitude. Achieve a score above 80% to earn challenge points.', '2026-08-10', '200 PTS + Aptitude Badge'),
        ('Build & Deploy Full-Stack Mini Project', 'Mini Project', 500, 'Build a modern web app (e.g. Portfolio, Task Tracker, E-commerce) and deploy on Vercel/Netlify with GitHub source code.', '2026-08-25', '500 PTS + Featured Developer Badge'),
        ('Host a College Tech Workshop', 'Event & Workshop', 500, 'Organize a tech awareness session or mini-workshop in your college about Mira Tech Internships.', '2026-08-15', '500 PTS + Official Event Banner'),
        ('Reach 5 Campus Registrations', 'Campus Outreach', 300, 'Get 5 students from your college to enroll using your unique referral code.', '2026-08-01', '300 PTS + Bronze Badge'),
        ('LinkedIn Tech Feature Post', 'Social Media', 150, 'Share our official Mira Future Tech Vision internship flyer on your LinkedIn profile tagging us.', '2026-07-31', '150 PTS + Official Repost')
      `);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        name VARCHAR(255),
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        college_name VARCHAR(255) NOT NULL,
        degree VARCHAR(100),
        branch VARCHAR(100),
        year VARCHAR(50),
        duration VARCHAR(50),
        domain VARCHAR(100),
        skills TEXT,
        resume_link VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add payment and OTP fields to existing internships table
    try { await pool.query('ALTER TABLE internships ADD COLUMN payment_status VARCHAR(50) DEFAULT "Pending"'); } catch (e) {}
    try { await pool.query('ALTER TABLE internships ADD COLUMN transaction_id VARCHAR(255) DEFAULT NULL'); } catch (e) {}
    try { await pool.query('ALTER TABLE internships ADD COLUMN otp VARCHAR(10) DEFAULT NULL'); } catch (e) {}
    try { await pool.query('ALTER TABLE internships ADD COLUMN otp_expiry DATETIME DEFAULT NULL'); } catch (e) {}

    // Add attendance and certificate fields to internships table
    try { await pool.query('ALTER TABLE internships ADD COLUMN present_days INT DEFAULT 0'); } catch (e) {}
    try { await pool.query('ALTER TABLE internships ADD COLUMN total_days INT DEFAULT 30'); } catch (e) {}
    try { await pool.query("ALTER TABLE internships ADD COLUMN certificate_override VARCHAR(50) DEFAULT 'Auto'"); } catch (e) {}

    // System Settings Table for global config
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    try {
      await pool.query("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('mandatory_attendance_threshold', '85')");
    } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS internship_domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'Unpaid',
        duration VARCHAR(100),
        stipend VARCHAR(255),
        features TEXT,
        skills TEXT,
        popular BOOLEAN DEFAULT FALSE,
        price INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS benefits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emp_id VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        number VARCHAR(20) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        resume_link VARCHAR(255),
        address TEXT,
        password VARCHAR(255) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Try to add emp_id to existing table if it was created before
    try {
      await pool.query('ALTER TABLE employees ADD COLUMN emp_id VARCHAR(50) UNIQUE AFTER id');
    } catch (e) {}
    
    // Add password reset and OTP columns to employees
    try {
      await pool.query('ALTER TABLE employees ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL');
      await pool.query('ALTER TABLE employees ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL');
    } catch (e) {}

    try {
      await pool.query('ALTER TABLE employees ADD COLUMN otp VARCHAR(10) DEFAULT NULL');
      await pool.query('ALTER TABLE employees ADD COLUMN otp_expiry DATETIME DEFAULT NULL');
    } catch (e) {}

    // Add shift timing settings for employees
    try {
      await pool.query("ALTER TABLE employees ADD COLUMN checkin_deadline TIME DEFAULT '11:00:00'");
      await pool.query("ALTER TABLE employees ADD COLUMN checkout_time TIME DEFAULT '17:30:00'");
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        time_in TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY emp_date (employee_id, date)
      )
    `);

    // Add time_out column for attendance checkout if it doesn't exist
    try { await pool.query('ALTER TABLE attendance ADD COLUMN time_out TIME DEFAULT NULL AFTER time_in'); } catch (e) {}
    
    // Add location columns for attendance tracking
    try {
      await pool.query('ALTER TABLE attendance ADD COLUMN location_in VARCHAR(255) DEFAULT NULL');
      await pool.query('ALTER TABLE attendance ADD COLUMN location_out VARCHAR(255) DEFAULT NULL');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100),
        college_name VARCHAR(255),
        course VARCHAR(100),
        branch VARCHAR(100),
        passing_year VARCHAR(10),
        domain VARCHAR(100) NOT NULL,
        correct INT DEFAULT 0,
        wrong INT DEFAULT 0,
        unanswered INT DEFAULT 0,
        total INT DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hiring_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        resume_link VARCHAR(255) NOT NULL,
        position VARCHAR(100) NOT NULL,
        skills TEXT NOT NULL,
        introduction TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT,
        status VARCHAR(50) DEFAULT 'Pending',
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date DATE,
        attachment_url VARCHAR(500) DEFAULT NULL,
        attachment_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);
    // Migrate existing tables to add attachment columns if not present
    try { await pool.query(`ALTER TABLE tasks ADD COLUMN attachment_url VARCHAR(500) DEFAULT NULL`); } catch (e) { /* already exists */ }
    try { await pool.query(`ALTER TABLE tasks ADD COLUMN attachment_name VARCHAR(255) DEFAULT NULL`); } catch (e) { /* already exists */ }


    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT,
        user_id INT,
        user_type VARCHAR(50), 
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT,
        employee_id INT,
        file_url VARCHAR(255),
        file_name VARCHAR(255),
        comment TEXT,
        time_spent DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    try { await pool.query('ALTER TABLE submissions ADD COLUMN comment TEXT'); } catch(e) {}
    try { await pool.query('ALTER TABLE submissions ADD COLUMN time_spent DECIMAL(5,2) DEFAULT 0'); } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_type VARCHAR(50),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        payment_id VARCHAR(255) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        domain VARCHAR(100) NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // --- INTERNSHIP MANAGEMENT TABLES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS intern_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_audience VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        resource_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS intern_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT,
        intern_id INT,
        submission_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'Pending Review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES intern_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (intern_id) REFERENCES internships(id) ON DELETE CASCADE,
        UNIQUE KEY intern_project (intern_id, project_id)
      )
    `);

    try { await pool.query('ALTER TABLE intern_submissions ADD COLUMN github_url VARCHAR(500)'); } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS intern_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT,
        date DATE NOT NULL,
        time_in TIME,
        time_out TIME,
        status VARCHAR(50) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY intern_date (intern_id, date),
        FOREIGN KEY (intern_id) REFERENCES internships(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS intern_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT,
        issue_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        pdf_url VARCHAR(500),
        png_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES internships(id) ON DELETE CASCADE
      )
    `);

    try { await pool.query('ALTER TABLE intern_certificates ADD COLUMN png_url VARCHAR(500)'); } catch(e) {}

    // --- REWARDS & RESOURCES TABLES ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        points INT DEFAULT 100,
        description TEXT,
        type VARCHAR(50) DEFAULT 'Reward',
        target_type VARCHAR(50) DEFAULT 'All',
        target_value VARCHAR(255) DEFAULT 'All',
        resource_url VARCHAR(500),
        file_path VARCHAR(500),
        image_icon VARCHAR(50) DEFAULT '🎁',
        bg_gradient VARCHAR(100) DEFAULT 'from-purple-600 to-indigo-600',
        in_stock BOOLEAN DEFAULT TRUE,
        popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await pool.query('ALTER TABLE student_rewards ADD COLUMN target_type VARCHAR(50) DEFAULT "All"'); } catch(e) {}
    try { await pool.query('ALTER TABLE student_rewards ADD COLUMN target_value VARCHAR(255) DEFAULT "All"'); } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_reward_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        claim_code VARCHAR(50) NOT NULL UNIQUE,
        student_email VARCHAR(255) NOT NULL,
        reward_id INT NOT NULL,
        reward_title VARCHAR(255) NOT NULL,
        points_used INT NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Processing',
        tracking_no VARCHAR(100) DEFAULT 'ORD-PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed. Ensure MySQL is running on localhost and credentials are correct:", error.message);
  }
};

initDb();

module.exports = pool;
