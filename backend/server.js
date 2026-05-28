require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const app = express();
app.use(express.json());
// CORS configuration to allow credentials (important for websockets sometimes)
app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Pass io to request object so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
  });

  socket.on('join_task', (taskId) => {
    socket.join(`task_${taskId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { passkey } = req.body;
    const adminPasskey = process.env.ADMIN_PASSKEY || 'MFTV2006';

    if (passkey !== adminPasskey) {
      return res.status(400).json({ error: 'Invalid Pass Key' });
    }

    const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: 'admin', name: 'Administrator', role: 'admin' } });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Contact Form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'mirafuturetechvision@gmail.com', // Admin email
      subject: `New Contact Form Submission from ${name}`,
      text: `You have received a new message.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit internship application
app.post('/api/internships/apply', async (req, res) => {
  try {
    const {
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, message
    } = req.body;

    const query = `
      INSERT INTO internships (
        full_name, email, phone, college_name, degree, branch,
        year, duration, domain, skills, resume_link, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, message
    ]);

    res.status(201).json({ message: 'Internship application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Submit hiring application (Join Venuguard)
app.post('/api/hiring/apply', async (req, res) => {
  try {
    const {
      full_name, mobile_number, email, resume_link, position, skills, introduction
    } = req.body;

    if (!full_name || !mobile_number || !email || !resume_link || !position || !skills || !introduction) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
      INSERT INTO hiring_applications (
        full_name, mobile_number, email, resume_link, position, skills, introduction
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      full_name, mobile_number, email, resume_link, position, skills, introduction
    ]);

    res.status(201).json({ message: 'Application submitted successfully! Our team will review it shortly.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
});

// Get all internships (Admin only)
app.get('/api/internships', authenticateToken, async (req, res) => {
  try {
    const [internships] = await pool.query('SELECT * FROM internships ORDER BY created_at DESC');
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all hiring applications (Admin only)
app.get('/api/admin/hiring-applications', authenticateToken, async (req, res) => {
  try {
    const [applications] = await pool.query('SELECT * FROM hiring_applications ORDER BY created_at DESC');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching hiring applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employee Registration
app.post('/api/employees/register', async (req, res) => {
  try {
    const { name, email, number, designation, resume_link, address, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });

    const [existing] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const emp_id = 'MFTV-' + Math.floor(1000 + Math.random() * 9000); // Generate Employee ID

    await pool.query(
      'INSERT INTO employees (emp_id, name, email, number, designation, resume_link, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [emp_id, name, email, number, designation, resume_link, address, hashedPassword]
    );
    res.status(201).json({ message: 'Employee registered successfully. Waiting for admin verification.' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Employee Login
app.post('/api/employees/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.verified) return res.status(403).json({ error: 'Account not verified by admin yet' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await pool.query('UPDATE employees SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, otpExpiry, user.id]);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Login OTP',
      html: `<h3>Your Verification Code</h3><p>Your OTP for login is: <strong style="font-size:24px;">${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    });

    res.json({ require2FA: true, email: user.email, message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Employee Verify Login OTP
app.post('/api/employees/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const [users] = await pool.query('SELECT * FROM employees WHERE email = ? AND otp = ? AND otp_expiry > NOW()', [email, otp]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = users[0];
    
    // Clear OTP
    await pool.query('UPDATE employees SET otp = NULL, otp_expiry = NULL WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, designation: user.designation } });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Employee Forgot Password
app.post('/api/employees/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: 'User with this email not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await pool.query('UPDATE employees SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, otpExpiry, email]);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your employee account.</p>
        <p>Your OTP for password reset is: <strong style="font-size:24px;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.json({ message: 'OTP sent to your email for password reset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Employee Reset Password
app.post('/api/employees/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP and new password required' });

    const [users] = await pool.query('SELECT * FROM employees WHERE email = ? AND otp = ? AND otp_expiry > NOW()', [email, otp]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE employees SET password = ?, otp = NULL, otp_expiry = NULL WHERE id = ?', [hashedPassword, users[0].id]);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get current Employee
app.get('/api/employees/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, emp_id, name, email, number, designation, resume_link, address, verified, created_at FROM employees WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Admin routes for Employees
app.get('/api/admin/employees', authenticateToken, async (req, res) => {
  try {
    const [employees] = await pool.query('SELECT id, emp_id, name, email, number, designation, resume_link, address, verified, created_at FROM employees ORDER BY created_at DESC');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/admin/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { designation, verified } = req.body;
    await pool.query('UPDATE employees SET designation = COALESCE(?, designation), verified = COALESCE(?, verified) WHERE id = ?', [designation, verified, id]);
    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/admin/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM attendance WHERE employee_id = ?', [id]); // Cascade delete attendance
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Submit Attendance (Employee)
app.post('/api/employees/attendance', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const time_in = new Date().toTimeString().split(' ')[0];

    const [existing] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employee_id, date]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    await pool.query('INSERT INTO attendance (employee_id, date, time_in) VALUES (?, ?, ?)', [employee_id, date, time_in]);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get My Attendance (Employee)
app.get('/api/employees/attendance', authenticateToken, async (req, res) => {
  try {
    const [records] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC', [req.user.id]);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get All Attendance (Admin)
app.get('/api/admin/attendance', authenticateToken, async (req, res) => {
  try {
    const [records] = await pool.query(`
      SELECT a.*, e.name, e.emp_id 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      ORDER BY a.date DESC, a.time_in DESC
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Dashboard Analytics (Admin)
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const [empCount] = await pool.query('SELECT COUNT(*) as count FROM employees');
    const [internCount] = await pool.query('SELECT COUNT(*) as count FROM internships');

    const date = new Date().toISOString().split('T')[0];
    const [attCount] = await pool.query('SELECT COUNT(*) as count FROM attendance WHERE date = ?', [date]);

    const [unverifiedCount] = await pool.query('SELECT COUNT(*) as count FROM employees WHERE verified = false OR verified IS NULL');

    res.json({
      totalEmployees: empCount[0].count,
      totalInternships: internCount[0].count,
      todaysAttendance: attCount[0].count,
      unverifiedEmployees: unverifiedCount[0].count
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Submit Quiz Result (Public - no auth needed)
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { name, email, roll_number, college_name, course, branch, passing_year, domain, correct, wrong, unanswered, total, percentage } = req.body;
    if (!name || !email || !domain) return res.status(400).json({ error: 'Required fields missing' });
    await pool.query(
      `INSERT INTO quiz_results (name, email, roll_number, college_name, course, branch, passing_year, domain, correct, wrong, unanswered, total, percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, roll_number, college_name, course, branch, passing_year, domain, correct, wrong, unanswered, total, percentage]
    );
    res.status(201).json({ message: 'Quiz result saved successfully' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get All Quiz Results (Admin only)
app.get('/api/admin/quiz-results', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM quiz_results ORDER BY created_at DESC');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get Quiz Analytics Summary (Admin only)
app.get('/api/admin/quiz-analytics', authenticateToken, async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM quiz_results');
    const [passed] = await pool.query('SELECT COUNT(*) as count FROM quiz_results WHERE percentage >= 60');
    const [avgScore] = await pool.query('SELECT AVG(percentage) as avg FROM quiz_results');
    const [byDomain] = await pool.query('SELECT domain, COUNT(*) as count, AVG(percentage) as avg_score FROM quiz_results GROUP BY domain ORDER BY count DESC');
    res.json({
      totalAttempts: total[0].count,
      passedCount: passed[0].count,
      failedCount: total[0].count - passed[0].count,
      avgScore: Math.round(avgScore[0].avg || 0),
      byDomain
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// ENTERPRISE PROJECT MANAGEMENT APIs
// ==========================================

// Projects API
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, start_date, end_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, start_date, end_date) VALUES (?, ?, ?, ?)',
      [name, description, start_date, end_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Project created' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(projects[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Tasks API
app.post('/api/tasks', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { project_id, title, description, assigned_to, priority, due_date } = req.body;
    const attachment_url = req.file ? '/uploads/' + req.file.filename : null;
    const attachment_name = req.file ? req.file.originalname : null;

    const [result] = await pool.query(
      'INSERT INTO tasks (project_id, title, description, assigned_to, priority, due_date, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [project_id, title, description, assigned_to, priority, due_date, attachment_url, attachment_name]
    );
    const newTask = { id: result.insertId, project_id, title, description, assigned_to, status: 'Pending', priority, due_date, attachment_url, attachment_name };
    req.io.to(`project_${project_id}`).emit('task_created', newTask);

    // Notify employee
    if (assigned_to) {
      await pool.query('INSERT INTO notifications (user_id, user_type, message) VALUES (?, ?, ?)', [assigned_to, 'employee', `You have been assigned a new task: ${title}`]);
    }

    res.status(201).json({ id: result.insertId, message: 'Task created' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = 'SELECT t.*, p.name as project_name, e.name as assignee_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id LEFT JOIN employees e ON t.assigned_to = e.id WHERE 1=1';
    const params = [];

    // If the requester is an employee, always filter to their own tasks
    if (req.user.role === 'employee') {
      query += ' AND t.assigned_to = ?';
      params.push(req.user.id);
    } else if (req.query.assigned_to) {
      // Admin can optionally filter by assigned_to
      query += ' AND t.assigned_to = ?';
      params.push(req.query.assigned_to);
    }

    if (project_id) {
      query += ' AND t.project_id = ?';
      params.push(project_id);
    }

    query += ' ORDER BY t.created_at DESC';
    const [tasks] = await pool.query(query, params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { status, priority, due_date, assigned_to } = req.body;
    const { id } = req.params;
    await pool.query(
      'UPDATE tasks SET status = COALESCE(?, status), priority = COALESCE(?, priority), due_date = COALESCE(?, due_date), assigned_to = COALESCE(?, assigned_to) WHERE id = ?',
      [status, priority, due_date, assigned_to, id]
    );
    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (updatedTask.length > 0) {
      req.io.to(`project_${updatedTask[0].project_id}`).emit('task_updated', updatedTask[0]);
      req.io.to(`task_${id}`).emit('task_updated', updatedTask[0]);
    }
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Task Comments
app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    const task_id = req.params.id;
    const user_id = req.user.id;
    // Simple way to distinguish admin vs employee: check if req.user has role='employee'
    const user_type = req.user.role === 'employee' ? 'employee' : 'admin';

    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, user_type, comment) VALUES (?, ?, ?, ?)',
      [task_id, user_id, user_type, comment]
    );

    // Fetch comment with user info
    let userName = 'User';
    if (user_type === 'employee') {
      const [emp] = await pool.query('SELECT name FROM employees WHERE id = ?', [user_id]);
      if (emp.length) userName = emp[0].name;
    } else {
      const [adm] = await pool.query('SELECT name FROM users WHERE id = ?', [user_id]);
      if (adm.length) userName = adm[0].name;
    }

    const newComment = { id: result.insertId, task_id, user_id, user_type, comment, created_at: new Date(), userName };
    req.io.to(`task_${task_id}`).emit('new_comment', newComment);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  try {
    const [comments] = await pool.query(`
      SELECT c.*, 
        CASE WHEN c.user_type = 'employee' THEN e.name ELSE u.name END as userName
      FROM task_comments c
      LEFT JOIN employees e ON c.user_id = e.id AND c.user_type = 'employee'
      LEFT JOIN users u ON c.user_id = u.id AND c.user_type = 'admin'
      WHERE c.task_id = ? ORDER BY c.created_at ASC
    `, [req.params.id]);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// File Submissions
app.post('/api/tasks/:id/submissions', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const task_id = req.params.id;
    const employee_id = req.user.id;
    const file_url = '/uploads/' + req.file.filename;
    const file_name = req.file.originalname;
    const comment = req.body.comment || null;
    const time_spent = req.body.time_spent ? parseFloat(req.body.time_spent) : 0;

    await pool.query(
      'INSERT INTO submissions (task_id, employee_id, file_url, file_name, comment, time_spent) VALUES (?, ?, ?, ?, ?, ?)',
      [task_id, employee_id, file_url, file_name, comment, time_spent]
    );

    await pool.query("UPDATE tasks SET status = 'Review' WHERE id = ?", [task_id]);
    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [task_id]);
    req.io.to(`project_${updatedTask[0].project_id}`).emit('task_updated', updatedTask[0]);

    res.status(201).json({ message: 'File submitted successfully', file_url });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/tasks/:id/submissions', authenticateToken, async (req, res) => {
  try {
    const [submissions] = await pool.query('SELECT s.*, e.name as employee_name FROM submissions s JOIN employees e ON s.employee_id = e.id WHERE s.task_id = ? ORDER BY s.created_at DESC', [req.params.id]);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // e.g. Approved, Rejected
    await pool.query('UPDATE submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Submission status updated' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.role === 'employee' ? 'employee' : 'admin';
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC', [user_id, user_type]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Advanced Analytics API
app.get('/api/analytics/pm', authenticateToken, async (req, res) => {
  try {
    const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects');
    const [taskStats] = await pool.query("SELECT status, COUNT(*) as count FROM tasks GROUP BY status");
    const [overdueTasks] = await pool.query("SELECT COUNT(*) as count FROM tasks WHERE due_date < CURDATE() AND status != 'Completed'");
    const [productivity] = await pool.query(`
      SELECT e.name, COUNT(t.id) as completed_tasks 
      FROM employees e 
      JOIN tasks t ON e.id = t.assigned_to 
      WHERE t.status = 'Completed' 
      GROUP BY e.id 
      ORDER BY completed_tasks DESC LIMIT 5
    `);

    res.json({
      totalProjects: projectCount[0]?.count || 0,
      taskStats: taskStats,
      overdueTasks: overdueTasks[0]?.count || 0,
      topPerformers: productivity
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Razorpay: Create Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { name, email, phone, domain } = req.body;
    const amount = 2499 * 100; // Amount in paise

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order in database
    await pool.query(
      'INSERT INTO payments (order_id, name, email, phone, domain, amount) VALUES (?, ?, ?, ?, ?, ?)',
      [order.id, name, email, phone, domain, amount]
    );

    res.json({ orderId: order.id, amount, currency: order.currency });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Razorpay: Verify Payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment successful, update database
      await pool.query(
        "UPDATE payments SET status = 'Paid', payment_id = ? WHERE order_id = ?",
        [razorpay_payment_id, razorpay_order_id]
      );
      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid signature, payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

const PORT = process.env.PORT || 5001;

// Cron job to check for overdue tasks and send email notifications
// Runs every day at 9:00 AM ('0 9 * * *') - For testing, you can change to '* * * * *' (every minute)
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running cron job for overdue tasks...');
    const [overdueTasks] = await pool.query(`
      SELECT t.id, t.title, t.due_date, e.name as employee_name, e.email as employee_email, p.name as project_name
      FROM tasks t
      JOIN employees e ON t.assigned_to = e.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.due_date < CURDATE() AND t.status != 'Completed'
    `);

    if (overdueTasks.length > 0) {
      console.log(`Found ${overdueTasks.length} overdue tasks. Sending emails...`);
      for (const task of overdueTasks) {
        if (task.employee_email && process.env.SMTP_USER && process.env.SMTP_PASS) {
          const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: task.employee_email,
            subject: `Action Required: Overdue Task - ${task.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e11d48;">Overdue Task Alert</h2>
                <p>Hi <strong>${task.employee_name}</strong>,</p>
                <p>This is an automated reminder that the following task is currently <strong>overdue</strong>:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Task:</strong> ${task.title}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Project:</strong> ${task.project_name || 'N/A'}</p>
                  <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <p>Please review your Kanban board and submit your work as soon as possible.</p>
                <br/>
                <p>Regards,</p>
                <p><strong>Admin Team</strong></p>
              </div>
            `
          };
          await transporter.sendMail(mailOptions);
        }
      }
      console.log('Overdue task emails sent successfully.');
    } else {
      console.log('No overdue tasks found.');
    }
  } catch (error) {
    console.error('Error running overdue tasks cron job:', error);
  }
});

// Cron job to check for overdue projects and send email notifications to admin
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Running cron job for overdue projects...');
    const [overdueProjects] = await pool.query(`
      SELECT p.id, p.name, p.end_date
      FROM projects p
      WHERE p.end_date < CURDATE() AND p.status != 'Completed'
    `);

    if (overdueProjects.length > 0 && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ADMIN_EMAIL) {
      console.log(`Found ${overdueProjects.length} overdue projects. Sending emails to admin...`);
      for (const project of overdueProjects) {
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `Admin Alert: Overdue Project - ${project.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #e11d48;">Overdue Project Alert</h2>
              <p>Hi <strong>Admin</strong>,</p>
              <p>This is an automated reminder that the following project is currently <strong>overdue</strong>:</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Project:</strong> ${project.name}</p>
                <p style="margin: 0;"><strong>End Date:</strong> ${new Date(project.end_date).toLocaleDateString()}</p>
              </div>
              <p>Please review the project timeline and follow up with the assigned employees.</p>
              <br/>
              <p>Regards,</p>
              <p><strong>System Mailer</strong></p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
      }
      console.log('Overdue project emails sent successfully.');
    } else {
      console.log('No overdue projects found.');
    }
  } catch (error) {
    console.error('Error running overdue projects cron job:', error);
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
