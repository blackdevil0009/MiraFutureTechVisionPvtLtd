require('dotenv').config();
process.env.TZ = 'Asia/Kolkata'; // Force IST timezone globally
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
    if (req.user.role === 'admin') {
      return res.json({ id: 'admin', name: 'Administrator', role: 'admin' });
    }
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
      year, duration, domain, skills, resume_link, message, payment_status
    } = req.body;

    const query = `
      INSERT INTO internships (
        full_name, email, phone, college_name, degree, branch,
        year, duration, domain, skills, resume_link, message, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, message, payment_status || 'Pending'
    ]);

    res.status(201).json({ message: 'Internship application submitted successfully', insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Admin: Manually Add Intern (Auto-Approved)
app.post('/api/admin/internships/manual', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const {
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, message, payment_status
    } = req.body;

    const query = `
      INSERT INTO internships (
        full_name, email, phone, college_name, degree, branch,
        year, duration, domain, skills, resume_link, message, payment_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
    `;

    const [result] = await pool.query(query, [
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, message, payment_status || 'Completed'
    ]);

    res.status(201).json({ message: 'Intern added and approved successfully', insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add intern' });
  }
});

// Admin: Approve Internship Application
app.put('/api/admin/internships/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    await pool.query("UPDATE internships SET status = 'Approved' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Internship approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve internship' });
  }
});

// Admin: Edit Intern Details
app.put('/api/admin/internships/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const {
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, payment_status
    } = req.body;

    const query = `
      UPDATE internships 
      SET full_name = ?, email = ?, phone = ?, college_name = ?, degree = ?, branch = ?,
          year = ?, duration = ?, domain = ?, skills = ?, resume_link = ?, payment_status = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      full_name, email, phone, college_name, degree, branch,
      year, duration, domain, skills, resume_link, payment_status,
      req.params.id
    ]);

    res.json({ message: 'Intern details updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update intern details' });
  }
});

// Update internship payment status
app.post('/api/internships/payment-update', async (req, res) => {
  try {
    const { email, transactionId, status } = req.body;
    
    // We update by email since we don't have the exact ID returned in all cases, or we can update by email and domain
    const query = `
      UPDATE internships 
      SET payment_status = ?, transaction_id = ?
      WHERE email = ?
      ORDER BY created_at DESC LIMIT 1
    `;
    
    await pool.query(query, [status, transactionId, email]);
    
    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// --- DOMAINS CRUD ---
app.get('/api/domains', async (req, res) => {
  try {
    const [domains] = await pool.query('SELECT * FROM internship_domains ORDER BY created_at DESC');
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

app.post('/api/admin/domains', authenticateToken, async (req, res) => {
  try {
    const { title, category, type, duration, stipend, features, skills, popular, price } = req.body;
    const query = 'INSERT INTO internship_domains (title, category, type, duration, stipend, features, skills, popular, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.query(query, [title, category, type, duration, stipend, JSON.stringify(features), JSON.stringify(skills), popular, price]);
    res.status(201).json({ message: 'Domain added' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/admin/domains/:id', authenticateToken, async (req, res) => {
  try {
    const { title, category, type, duration, stipend, features, skills, popular, price } = req.body;
    const query = 'UPDATE internship_domains SET title=?, category=?, type=?, duration=?, stipend=?, features=?, skills=?, popular=?, price=? WHERE id=?';
    await pool.query(query, [title, category, type, duration, stipend, JSON.stringify(features), JSON.stringify(skills), popular, price, req.params.id]);
    res.json({ message: 'Domain updated' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/admin/domains/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM internship_domains WHERE id=?', [req.params.id]);
    res.json({ message: 'Domain deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- BENEFITS CRUD ---
app.get('/api/benefits', async (req, res) => {
  try {
    const [benefits] = await pool.query('SELECT * FROM benefits ORDER BY created_at DESC');
    res.json(benefits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

app.post('/api/admin/benefits', authenticateToken, async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    await pool.query('INSERT INTO benefits (title, description, icon) VALUES (?, ?, ?)', [title, description, icon]);
    res.status(201).json({ message: 'Benefit added' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/admin/benefits/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    await pool.query('UPDATE benefits SET title=?, description=?, icon=? WHERE id=?', [title, description, icon, req.params.id]);
    res.json({ message: 'Benefit updated' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/admin/benefits/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM benefits WHERE id=?', [req.params.id]);
    res.json({ message: 'Benefit deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- STUDENT AUTHENTICATION ---
app.post('/api/student/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const [interns] = await pool.query("SELECT id, full_name, status FROM internships WHERE email = ? AND status = 'Approved'", [email]);
    
    if (interns.length === 0) {
      return res.status(404).json({ error: 'Email not found or application is pending approval' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await pool.query('UPDATE internships SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, expiry, email]);
    
    // Send email asynchronously in the background so the API responds instantly
    transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Student Portal Login OTP',
      html: `<h3>Your Login Code</h3><p>Your OTP for the student portal is: <strong style="font-size:24px;">${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    }).catch(err => console.error('Background OTP Email Error:', err));
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('OTP Request Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.post('/api/student/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [interns] = await pool.query('SELECT * FROM internships WHERE email = ?', [email]);
    
    if (interns.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const intern = interns[0];
    
    if (!intern.otp || intern.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    if (new Date() > new Date(intern.otp_expiry)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Clear OTP
    await pool.query('UPDATE internships SET otp = NULL, otp_expiry = NULL WHERE email = ?', [email]);
    
    const token = jwt.sign(
      { id: intern.id, email: intern.email, role: 'student' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, student: { name: intern.full_name, email: intern.email } });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.get('/api/student/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    
    const [interns] = await pool.query('SELECT full_name as name, email, phone, college_name, branch, domain, skills, resume_link, payment_status, created_at FROM internships WHERE id = ?', [req.user.id]);
    
    if (interns.length === 0) return res.status(404).json({ error: 'Student not found' });
    
    res.json(interns[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process forgot password request' });
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
    const [employees] = await pool.query('SELECT id, emp_id, name, email, number, designation, resume_link, address, verified, checkin_deadline, checkout_time, created_at FROM employees ORDER BY created_at DESC');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/admin/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { designation, verified, checkin_deadline, checkout_time } = req.body;
    await pool.query(
      'UPDATE employees SET designation = COALESCE(?, designation), verified = COALESCE(?, verified), checkin_deadline = COALESCE(?, checkin_deadline), checkout_time = COALESCE(?, checkout_time) WHERE id = ?', 
      [designation, verified, checkin_deadline, checkout_time, id]
    );
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

// Admin delete endpoints for Internships, Hiring, and Campus Ambassadors
app.delete('/api/admin/internships/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM internships WHERE id = ?', [req.params.id]);
    res.json({ message: 'Internship application removed' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/admin/hiring-applications/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM hiring_applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Hiring application removed' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/admin/campus-ambassadors/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM campus_ambassadors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campus Ambassador removed' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});


// Submit Attendance (Employee)
app.post('/api/employees/attendance', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user.id;
    const { location } = req.body;
    const now = new Date();
    // Force IST (Asia/Kolkata) timezone for precise real-time attendance
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const time_in = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', timeStyle: 'medium' }).format(now);

    const [empInfo] = await pool.query('SELECT checkin_deadline FROM employees WHERE id = ?', [employee_id]);
    if (empInfo.length === 0) return res.status(404).json({ error: 'Employee not found' });
    const deadline = empInfo[0].checkin_deadline || '11:00:00';

    if (time_in > deadline) {
      return res.status(400).json({ error: `You cannot check in after your deadline of ${deadline}` });
    }

    const [existing] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employee_id, date]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    await pool.query('INSERT INTO attendance (employee_id, date, time_in, location_in) VALUES (?, ?, ?, ?)', [employee_id, date, time_in, location || 'Unknown Location']);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Checkout Attendance (Employee)
app.put('/api/employees/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user.id;
    const { location } = req.body;
    const now = new Date();
    // Force IST (Asia/Kolkata) timezone for precise real-time attendance
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const time_out = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', timeStyle: 'medium' }).format(now);

    const [empInfo] = await pool.query('SELECT checkout_time FROM employees WHERE id = ?', [employee_id]);
    if (empInfo.length === 0) return res.status(404).json({ error: 'Employee not found' });
    const earliestCheckout = empInfo[0].checkout_time || '17:30:00';

    if (time_out < earliestCheckout) {
      return res.status(400).json({ error: `You cannot check out before your shift ends at ${earliestCheckout}` });
    }

    const [existing] = await pool.query('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employee_id, date]);
    if (existing.length === 0) {
      return res.status(400).json({ error: 'You have not checked in today' });
    }

    if (existing[0].time_out) {
      return res.status(400).json({ error: 'You have already checked out today' });
    }

    await pool.query('UPDATE attendance SET time_out = ?, location_out = ? WHERE employee_id = ? AND date = ?', [time_out, location || 'Unknown Location', employee_id, date]);
    res.json({ message: 'Checked out successfully' });
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
    const { name, email, phone, domain, amount } = req.body;
    const finalAmount = amount ? parseInt(amount) * 100 : 99 * 100; // Amount in paise

    const options = {
      amount: finalAmount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order in database
    await pool.query(
      'INSERT INTO payments (order_id, name, email, phone, domain, amount) VALUES (?, ?, ?, ?, ?, ?)',
      [order.id, name, email, phone, domain, amount]
    );

    res.json({ orderId: order.id, amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy' });
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

// ==========================================
// CAMPUS AMBASSADOR ROUTES
// ==========================================

// Register Campus Ambassador
app.post('/api/campus/register', async (req, res) => {
  try {
    let { name, email, password, phone, college_name, instagram_url, linkedin_url } = req.body;
    email = email.trim();
    
    // Validate domain
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only @gmail.com email addresses are allowed.' });
    }

    // Check if email exists
    const [existing] = await pool.query('SELECT * FROM campus_ambassadors WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

    // Generate unique referral code
    const referral_code = 'CA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate required social follow URLs
    if (!instagram_url || !instagram_url.trim()) {
      return res.status(400).json({ error: 'Instagram profile URL is required after following our company page.' });
    }
    if (!linkedin_url || !linkedin_url.trim()) {
      return res.status(400).json({ error: 'LinkedIn profile URL is required after following our company page.' });
    }

    await pool.query(
      "INSERT INTO campus_ambassadors (name, email, password, phone, college_name, referral_code, instagram_url, linkedin_url, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')",
      [name, email, hashedPassword, phone, college_name, referral_code, instagram_url.trim(), linkedin_url.trim()]
    );

    res.json({ message: 'Campus Ambassador registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Login Campus Ambassador
app.post('/api/campus/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: '${email}' | Password Length: ${password ? password.length : 0}`);
    email = email?.trim() || '';
    
    const [ambassadors] = await pool.query('SELECT * FROM campus_ambassadors WHERE email = ?', [email]);
    const ambassador = ambassadors[0];

    if (!ambassador) {
      console.log('[LOGIN FAILED] Email not found in DB');
      return res.status(400).json({ error: 'Email not found or Invalid credentials' });
    }

    if (ambassador.status !== 'Active') {
      console.log('[LOGIN FAILED] Account inactive');
      return res.status(403).json({ error: 'Account inactive' });
    }

    const validPassword = await bcrypt.compare(password, ambassador.password);
    if (!validPassword) {
      console.log('[LOGIN FAILED] Password mismatch');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check social follow verification status
    if (ambassador.verification_status && ambassador.verification_status !== 'Verified') {
      if (ambassador.verification_status === 'Rejected') {
        console.log('[LOGIN FAILED] Verification rejected');
        return res.status(403).json({ error: 'Your campus ambassador account verification was rejected.' });
      }
      console.log('[LOGIN FAILED] Verification pending');
      return res.status(403).json({ error: 'Your account is pending social follow verification by admin. Please wait for admin approval before logging in.' });
    }

    console.log('[LOGIN SUCCESS] Token generated');

    const token = jwt.sign({ id: ambassador.id, role: 'campus_ambassador' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: ambassador.id,
        name: ambassador.name,
        email: ambassador.email,
        phone: ambassador.phone,
        college_name: ambassador.college_name,
        referral_code: ambassador.referral_code,
        referrals_count: ambassador.referrals_count || 0,
        points: ambassador.points || 0,
        instagram_url: ambassador.instagram_url || '',
        linkedin_url: ambassador.linkedin_url || '',
        upi_id: ambassador.upi_id || '',
        verification_status: ambassador.verification_status || 'Pending',
        status: ambassador.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Campus Ambassador Dashboard (Stats, Referral History, Leaderboard)
app.get('/api/campus/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'campus_ambassador') return res.status(403).json({ error: 'Unauthorized' });
    
    const [ambassadors] = await pool.query('SELECT id, name, email, phone, college_name, referral_code, referrals_count, points, instagram_url, linkedin_url, upi_id, verification_status, status, created_at FROM campus_ambassadors WHERE id = ?', [req.user.id]);
    if (ambassadors.length === 0) return res.status(404).json({ error: 'Ambassador profile not found' });
    const ambassador = ambassadors[0];

    // Fetch students registered with this referral code
    const [referrals] = await pool.query('SELECT id, full_name, email, domain, created_at FROM internships WHERE referral_code = ? ORDER BY created_at DESC', [ambassador.referral_code]);

    // Fetch top leaderboard ambassadors
    const [leaderboard] = await pool.query('SELECT name, college_name, referrals_count, points FROM campus_ambassadors ORDER BY referrals_count DESC, points DESC LIMIT 5');

    res.json({
      ambassador,
      referrals,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching CA dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get Campus Ambassador Profile
app.get('/api/campus/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'campus_ambassador') return res.status(403).json({ error: 'Unauthorized' });
    const [ambassadors] = await pool.query('SELECT id, name, email, phone, college_name, referral_code, referrals_count, points, instagram_url, linkedin_url, upi_id, verification_status, status, created_at FROM campus_ambassadors WHERE id = ?', [req.user.id]);
    res.json(ambassadors[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Campus Ambassador Profile
app.put('/api/campus/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'campus_ambassador') return res.status(403).json({ error: 'Unauthorized' });
    const { phone, college_name, instagram_url, linkedin_url, upi_id } = req.body;

    await pool.query(
      'UPDATE campus_ambassadors SET phone = ?, college_name = ?, instagram_url = ?, linkedin_url = ?, upi_id = ? WHERE id = ?',
      [phone, college_name, instagram_url, linkedin_url, upi_id, req.user.id]
    );

    const [updated] = await pool.query('SELECT id, name, email, phone, college_name, referral_code, referrals_count, points, instagram_url, linkedin_url, upi_id, verification_status, status FROM campus_ambassadors WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (error) {
    console.error('Error updating CA profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get Campus Ambassador Challenges with submission status
app.get('/api/campus/challenges', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'campus_ambassador') return res.status(403).json({ error: 'Unauthorized' });
    const ambassadorId = req.user.id;

    const [challenges] = await pool.query(`
      SELECT 
        c.*, 
        s.id as submission_id,
        s.status as submission_status, 
        s.proof_url, 
        s.notes, 
        s.created_at as submitted_at 
      FROM campus_challenges c 
      LEFT JOIN campus_challenge_submissions s 
        ON c.id = s.challenge_id AND s.ambassador_id = ? 
      ORDER BY c.created_at DESC`,
      [ambassadorId]
    );

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching CA challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Submit proof for Campus Ambassador Challenge
app.post('/api/campus/challenges/submit', authenticateToken, upload.single('proof_file'), async (req, res) => {
  try {
    if (req.user.role !== 'campus_ambassador') return res.status(403).json({ error: 'Unauthorized' });
    const { challenge_id, proof_url, notes } = req.body;

    if (!challenge_id) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    const finalProof = req.file ? `/uploads/${req.file.filename}` : (proof_url || '');

    // Insert submission or update existing
    const [existing] = await pool.query(
      'SELECT id FROM campus_challenge_submissions WHERE ambassador_id = ? AND challenge_id = ?',
      [req.user.id, challenge_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE campus_challenge_submissions SET proof_url = ?, notes = ?, status = "Pending" WHERE id = ?',
        [finalProof, notes || '', existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO campus_challenge_submissions (ambassador_id, challenge_id, proof_url, notes, status) VALUES (?, ?, ?, ?, "Pending")',
        [req.user.id, challenge_id, finalProof, notes || '']
      );
    }

    res.json({ message: 'Challenge submission sent for verification successfully!' });
  } catch (error) {
    console.error('Error submitting challenge proof:', error);
    res.status(500).json({ error: 'Failed to submit challenge proof' });
  }
});

// Admin: Get all Campus Ambassadors
app.get('/api/admin/campus-ambassadors', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [ambassadors] = await pool.query('SELECT id, name, email, phone, college_name, referral_code, referrals_count, points, instagram_url, linkedin_url, upi_id, verification_status, status, created_at FROM campus_ambassadors ORDER BY created_at DESC');
    res.json(ambassadors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campus ambassadors' });
  }
});

// Admin: Update Campus Ambassador Social Follow Verification Status
app.put('/api/admin/campus-ambassadors/:id/verification', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { verification_status } = req.body;
    if (!verification_status) return res.status(400).json({ error: 'verification_status is required' });

    await pool.query('UPDATE campus_ambassadors SET verification_status = ? WHERE id = ?', [verification_status, req.params.id]);
    res.json({ message: `Verification status updated to ${verification_status}` });
  } catch (error) {
    console.error('Error updating CA verification status:', error);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Admin: Update Campus Ambassador Social Follow Links
app.put('/api/admin/campus-ambassadors/:id/social-links', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { instagram_url, linkedin_url } = req.body;

    await pool.query('UPDATE campus_ambassadors SET instagram_url = ?, linkedin_url = ? WHERE id = ?', [instagram_url || '', linkedin_url || '', req.params.id]);
    res.json({ message: 'Social links updated successfully' });
  } catch (error) {
    console.error('Error updating CA social links:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Admin: Delete Campus Ambassador
app.delete('/api/admin/campus-ambassadors/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    await pool.query('DELETE FROM campus_ambassadors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ambassador deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ambassador' });
  }
});

// Admin: Get all Campus Challenges
app.get('/api/admin/campus/challenges', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM campus_challenges ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Admin: Create new Campus Challenge / Task
app.post('/api/admin/campus/challenges', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { title, category, points, description, deadline, reward_perk } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const [result] = await pool.query(
      'INSERT INTO campus_challenges (title, category, points, description, deadline, reward_perk) VALUES (?, ?, ?, ?, ?, ?)',
      [title, category || 'General', parseInt(points, 10) || 100, description || '', deadline || '', reward_perk || '']
    );

    const [newItem] = await pool.query('SELECT * FROM campus_challenges WHERE id = ?', [result.insertId]);
    res.json({ message: 'Challenge created successfully', challenge: newItem[0] });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Admin: Delete Campus Challenge
app.delete('/api/admin/campus/challenges/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    await pool.query('DELETE FROM campus_challenges WHERE id = ?', [req.params.id]);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Admin: Get all Campus Challenge Submissions
app.get('/api/admin/campus/submissions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.ambassador_id,
        s.challenge_id,
        s.proof_url,
        s.notes,
        s.status,
        s.created_at,
        a.name as ambassador_name,
        a.email as ambassador_email,
        a.college_name,
        c.title as challenge_title,
        c.points as challenge_points,
        c.category as challenge_category
      FROM campus_challenge_submissions s
      JOIN campus_ambassadors a ON s.ambassador_id = a.id
      JOIN campus_challenges c ON s.challenge_id = c.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Admin: Approve or Reject Campus Challenge Submission
app.put('/api/admin/campus/submissions/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    const [submissions] = await pool.query('SELECT * FROM campus_challenge_submissions WHERE id = ?', [id]);
    if (submissions.length === 0) return res.status(404).json({ error: 'Submission not found' });
    
    const sub = submissions[0];
    const previousStatus = sub.status;

    await pool.query('UPDATE campus_challenge_submissions SET status = ? WHERE id = ?', [status, id]);

    // If newly approved, award challenge points to ambassador
    if (status === 'Approved' && previousStatus !== 'Approved') {
      const [challenges] = await pool.query('SELECT points FROM campus_challenges WHERE id = ?', [sub.challenge_id]);
      const challengePoints = challenges[0]?.points || 100;

      await pool.query('UPDATE campus_ambassadors SET points = points + ? WHERE id = ?', [challengePoints, sub.ambassador_id]);
    }

    res.json({ message: `Submission status updated to ${status}` });
  } catch (error) {
    console.error('Error updating CA submission status:', error);
    res.status(500).json({ error: 'Failed to update status' });
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

// --- INTERNSHIP MANAGEMENT APIs (ADMIN & STUDENT) ---

// Admin: Upload a new project
app.post('/api/admin/intern-projects', authenticateToken, upload.single('resource_file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { target_audience, title, description } = req.body;
    const resource_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    await pool.query(
      'INSERT INTO intern_projects (target_audience, title, description, resource_url) VALUES (?, ?, ?, ?)',
      [target_audience, title, description, resource_url]
    );
    res.json({ message: 'Project created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Admin: Get all projects
app.get('/api/admin/intern-projects', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM intern_projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Admin: Edit a project
app.put('/api/admin/intern-projects/:id', authenticateToken, upload.single('resource_file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { target_audience, title, description } = req.body;
    let query = 'UPDATE intern_projects SET target_audience = ?, title = ?, description = ?';
    let params = [target_audience, title, description];
    
    if (req.file) {
      query += ', resource_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Admin: Delete a project
app.delete('/api/admin/intern-projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    await pool.query('DELETE FROM intern_projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Admin: Get distinct registered domains
app.get('/api/admin/registered-domains', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT DISTINCT domain FROM internships WHERE domain IS NOT NULL AND domain != "" ORDER BY domain ASC');
    const domains = rows.map(r => r.domain);
    res.json(domains);
  } catch (error) {
    console.error('Error fetching registered domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// Admin: Get all submissions
app.get('/api/admin/intern-submissions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query(`
      SELECT s.*, p.title as project_title, i.full_name as intern_name, i.domain 
      FROM intern_submissions s 
      JOIN intern_projects p ON s.project_id = p.id 
      JOIN internships i ON s.intern_id = i.id 
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Admin: Update submission status
app.put('/api/admin/intern-submissions/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { status } = req.body;
    await pool.query('UPDATE intern_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Admin: Delete intern submission
app.delete('/api/admin/intern-submissions/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    await pool.query('DELETE FROM intern_submissions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Admin: Get all intern attendance
app.get('/api/admin/intern-attendance', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query(`
      SELECT a.*, i.full_name as intern_name, i.domain, i.email, i.phone 
      FROM intern_attendance a 
      JOIN internships i ON a.intern_id = i.id 
      ORDER BY a.date DESC, a.time_in DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Admin: Get all certificates
app.get('/api/admin/intern-certificates', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    // Fetch all registered interns and their certificate status
    const [rows] = await pool.query(`
      SELECT i.id as intern_id, i.full_name as intern_name, i.domain,
             c.id as cert_id, c.status as cert_status, c.issue_date, c.pdf_url
      FROM internships i
      LEFT JOIN intern_certificates c ON i.id = c.intern_id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Admin: Batch Generate certificates
app.post('/api/admin/intern-certificates/generate', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    // Simplistic batch generate: find all approved interns and make certificates for them
    const [approvedInterns] = await pool.query("SELECT id FROM internships WHERE status = 'Approved'");
    const today = new Date().toISOString().split('T')[0];
    
    for (let intern of approvedInterns) {
      await pool.query(
        "INSERT INTO intern_certificates (intern_id, issue_date, status) VALUES (?, ?, 'Generated') ON DUPLICATE KEY UPDATE status='Generated'",
        [intern.id, today]
      );
    }
    
    res.json({ message: 'Certificates generated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate certificates' });
  }
});

// Admin: Manually Upload Certificate for a specific intern
app.post('/api/admin/intern-certificates/upload', authenticateToken, upload.single('certificate_file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { intern_id } = req.body;
    const pdf_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!pdf_url || !intern_id) {
      return res.status(400).json({ error: 'File and intern ID are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if certificate record exists
    const [existing] = await pool.query("SELECT id FROM intern_certificates WHERE intern_id = ?", [intern_id]);
    
    if (existing.length > 0) {
      await pool.query(
        "UPDATE intern_certificates SET pdf_url = ?, status = 'Generated', issue_date = ? WHERE intern_id = ?",
        [pdf_url, today, intern_id]
      );
    } else {
      await pool.query(
        "INSERT INTO intern_certificates (intern_id, issue_date, status, pdf_url) VALUES (?, ?, 'Generated', ?)",
        [intern_id, today, pdf_url]
      );
    }
    
    res.json({ message: 'Certificate uploaded successfully' });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ error: 'Failed to upload certificate' });
  }
});

// Student: Get their assigned projects
app.get('/api/student/projects', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [interns] = await pool.query('SELECT domain FROM internships WHERE id = ?', [req.user.id]);
    const domain = interns[0]?.domain ? interns[0].domain.trim() : '';
    console.log(`Student ${req.user.id} fetching projects for domain: '${domain}'`);
    
    const [projects] = await pool.query(
      `SELECT p.*, s.status as submission_status, s.submission_url, s.github_url 
       FROM intern_projects p 
       LEFT JOIN intern_submissions s ON p.id = s.project_id AND s.intern_id = ? 
       WHERE LOWER(p.target_audience) LIKE LOWER(?) OR p.target_audience = 'All' 
       ORDER BY p.created_at DESC`,
      [req.user.id, `%${domain}%`]
    );
    console.log(`Found ${projects.length} projects for student ${req.user.id}`);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching student projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Student: Get Certificate
app.get('/api/student/certificate', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM intern_certificates WHERE intern_id = ?', [req.user.id]);
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Student: Submit a project
app.post('/api/student/submit-project', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const { project_id, submission_url, github_url } = req.body;
    await pool.query(
      `INSERT INTO intern_submissions (project_id, intern_id, submission_url, github_url, status) 
       VALUES (?, ?, ?, ?, 'Pending Review') 
       ON DUPLICATE KEY UPDATE submission_url = ?, github_url = ?, status = 'Pending Review'`,
      [project_id, req.user.id, submission_url, github_url, submission_url, github_url]
    );
    res.json({ message: 'Project submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

// Student: Select a project (Add to Kanban)
app.post('/api/student/select-project', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const { project_id } = req.body;
    await pool.query(
      `INSERT INTO intern_submissions (project_id, intern_id, status) 
       VALUES (?, ?, 'Started')
       ON DUPLICATE KEY UPDATE status = status`, // Don't overwrite if it already exists
      [project_id, req.user.id]
    );
    res.json({ message: 'Project added to Kanban successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to select project' });
  }
});

// Student: Get profile
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT full_name, email, phone, college_name, skills, resume_link, domain FROM internships WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Student: Update profile
app.put('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const { phone, college_name, skills, resume_link } = req.body;
    await pool.query(
      'UPDATE internships SET phone = ?, college_name = ?, skills = ?, resume_link = ? WHERE id = ?',
      [phone, college_name, JSON.stringify(skills || []), resume_link, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Student: Dashboard stats
app.get('/api/student/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    
    // Get domain and status
    const [interns] = await pool.query('SELECT domain, status FROM internships WHERE id = ?', [req.user.id]);
    if (interns.length === 0) return res.status(404).json({ error: 'Intern not found' });
    const domain = interns[0].domain;
    const internshipStatus = interns[0].status;

    // Get attendance count
    const [attendanceRows] = await pool.query('SELECT COUNT(*) as days FROM intern_attendance WHERE intern_id = ?', [req.user.id]);
    const attendanceDays = attendanceRows[0].days;

    // Get assigned projects count
    const [assignedProjects] = await pool.query("SELECT COUNT(*) as count FROM intern_projects WHERE target_audience LIKE ? OR target_audience = 'All'", [`%${domain}%`]);
    
    // Get submitted projects count
    const [submittedProjects] = await pool.query("SELECT COUNT(*) as count FROM intern_submissions WHERE intern_id = ?", [req.user.id]);
    
    const pendingTasks = Math.max(0, assignedProjects[0].count - submittedProjects[0].count);

    // Get recent projects
    const [recentProjects] = await pool.query(
      "SELECT id, title, description, created_at FROM intern_projects WHERE target_audience LIKE ? OR target_audience = 'All' ORDER BY created_at DESC LIMIT 3", 
      [`%${domain}%`]
    );

    res.json({
      status: internshipStatus,
      pending_tasks: pendingTasks,
      attendance_days: attendanceDays,
      recent_projects: recentProjects
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Student: Get their attendance
app.get('/api/student/attendance', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM intern_attendance WHERE intern_id = ? ORDER BY date DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Student: Check In
app.post('/api/student/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const date = new Date().toISOString().split('T')[0];
    const time_in = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' });
    
    await pool.query(
      'INSERT INTO intern_attendance (intern_id, date, time_in, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE time_in = ?',
      [req.user.id, date, time_in, 'Present', time_in]
    );
    res.json({ message: 'Checked in successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Student: Check Out
app.post('/api/student/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const date = new Date().toISOString().split('T')[0];
    const time_out = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' });
    
    await pool.query(
      'UPDATE intern_attendance SET time_out = ? WHERE intern_id = ? AND date = ?',
      [time_out, req.user.id, date]
    );
    res.json({ message: 'Checked out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// Student: Get Certificate
app.get('/api/student/certificate', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM intern_certificates WHERE intern_id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.json({ status: 'Pending', pdf_url: null });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// ==========================================
// REWARDS & RESOURCES MANAGEMENT APIS
// ==========================================

// Admin: Get rewards target options (domains and students list)
app.get('/api/admin/rewards-options', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const [domainRows] = await pool.query("SELECT DISTINCT domain FROM internships WHERE domain IS NOT NULL AND domain != ''");
    const [hiringDomainRows] = await pool.query("SELECT DISTINCT title as domain FROM internship_domains WHERE title IS NOT NULL AND title != ''");
    
    const domainSet = new Set();
    hiringDomainRows.forEach(r => {
      if (r.domain && r.domain.trim()) domainSet.add(r.domain.trim());
    });
    domainRows.forEach(r => {
      if (r.domain && r.domain.trim()) domainSet.add(r.domain.trim());
    });

    const [studentRows] = await pool.query("SELECT id, full_name, email, domain FROM internships ORDER BY full_name ASC");

    res.json({
      domains: Array.from(domainSet),
      students: studentRows
    });
  } catch (error) {
    console.error('Error fetching rewards options:', error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

// Admin: Get all rewards & resources
app.get('/api/admin/rewards', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM student_rewards ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admin rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Admin: Create / Upload new reward or resource item
app.post('/api/admin/rewards', authenticateToken, upload.single('reward_file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const {
      title,
      category,
      points,
      description,
      type,
      target_type,
      target_value,
      resource_url,
      image_icon,
      bg_gradient,
      in_stock,
      popular
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const file_path = req.file ? `/uploads/${req.file.filename}` : null;
    const itemType = type || 'Reward';
    const targetType = target_type || 'All';
    const targetValue = target_value || 'All';
    const itemPoints = parseInt(points, 10) || 0;
    const itemInStock = in_stock === 'true' || in_stock === true || in_stock === '1' ? 1 : 1;
    const itemPopular = popular === 'true' || popular === true || popular === '1' ? 1 : 0;
    const icon = image_icon || '🎁';
    const gradient = bg_gradient || 'from-purple-600 to-indigo-600';

    const [result] = await pool.query(
      `INSERT INTO student_rewards 
       (title, category, points, description, type, target_type, target_value, resource_url, file_path, image_icon, bg_gradient, in_stock, popular)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, itemPoints, description || '', itemType, targetType, targetValue, resource_url || '', file_path, icon, gradient, itemInStock, itemPopular]
    );

    const [newItem] = await pool.query('SELECT * FROM student_rewards WHERE id = ?', [result.insertId]);
    res.json({ message: 'Reward / Resource created successfully', reward: newItem[0] });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Admin: Update existing reward or resource item
app.put('/api/admin/rewards/:id', authenticateToken, upload.single('reward_file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { id } = req.params;
    const {
      title,
      category,
      points,
      description,
      type,
      target_type,
      target_value,
      resource_url,
      image_icon,
      bg_gradient,
      in_stock,
      popular
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM student_rewards WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reward item not found' });
    }

    const file_path = req.file ? `/uploads/${req.file.filename}` : existing[0].file_path;
    const itemPoints = points !== undefined ? parseInt(points, 10) : existing[0].points;

    await pool.query(
      `UPDATE student_rewards SET
       title = ?, category = ?, points = ?, description = ?, type = ?, target_type = ?, target_value = ?, resource_url = ?, 
       file_path = ?, image_icon = ?, bg_gradient = ?, in_stock = ?, popular = ?
       WHERE id = ?`,
      [
        title || existing[0].title,
        category || existing[0].category,
        itemPoints,
        description !== undefined ? description : existing[0].description,
        type || existing[0].type,
        target_type || existing[0].target_type,
        target_value || existing[0].target_value,
        resource_url !== undefined ? resource_url : existing[0].resource_url,
        file_path,
        image_icon || existing[0].image_icon,
        bg_gradient || existing[0].bg_gradient,
        in_stock !== undefined ? (in_stock ? 1 : 0) : existing[0].in_stock,
        popular !== undefined ? (popular ? 1 : 0) : existing[0].popular,
        id
      ]
    );

    const [updatedItem] = await pool.query('SELECT * FROM student_rewards WHERE id = ?', [id]);
    res.json({ message: 'Reward updated successfully', reward: updatedItem[0] });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// Admin: Delete a reward or resource item
app.delete('/api/admin/rewards/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { id } = req.params;
    await pool.query('DELETE FROM student_rewards WHERE id = ?', [id]);
    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

// Admin: Get all student claim requests
app.get('/api/admin/reward-claims', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const [rows] = await pool.query('SELECT * FROM student_reward_claims ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claim requests' });
  }
});

// Admin: Update claim request status or tracking code
app.put('/api/admin/reward-claims/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const { id } = req.params;
    const { status, tracking_no } = req.body;

    await pool.query(
      'UPDATE student_reward_claims SET status = ?, tracking_no = ? WHERE id = ?',
      [status || 'Processing', tracking_no || 'ORD-PENDING', id]
    );

    res.json({ message: 'Claim status updated successfully' });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: 'Failed to update claim status' });
  }
});

// Student: Get Gifts & Point Balance & Claim History
app.get('/api/student/gifts', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const studentId = req.user.id;

    // Calculate student points
    const [attendanceRows] = await pool.query('SELECT COUNT(*) as count FROM intern_attendance WHERE intern_id = ?', [studentId]);
    const [submissionRows] = await pool.query("SELECT COUNT(*) as count FROM intern_submissions WHERE intern_id = ? AND status = 'Approved'", [studentId]);

    const attendanceDays = attendanceRows[0]?.count || 0;
    const approvedProjects = submissionRows[0]?.count || 0;
    const calculatedPoints = 500 + (attendanceDays * 20) + (approvedProjects * 100);

    // Get student info for targeted filtering
    const [studentInfo] = await pool.query('SELECT email, domain, full_name FROM internships WHERE id = ?', [studentId]);
    const studentEmail = studentInfo[0]?.email || '';
    const studentDomain = studentInfo[0]?.domain || '';
    const studentName = studentInfo[0]?.full_name || '';

    // Fetch active gifts from DB filtered by audience (All, Department, or Specific Student)
    const [gifts] = await pool.query(
      `SELECT * FROM student_rewards 
       WHERE (type IN ('Reward', 'LOR', 'Certificates') OR points > 0)
         AND (
           target_type = 'All' 
           OR target_value = 'All'
           OR (target_type = 'Department' AND LOWER(?) LIKE LOWER(CONCAT('%', target_value, '%')))
           OR (target_type = 'Student' AND (LOWER(target_value) = LOWER(?) OR LOWER(target_value) = LOWER(?)))
         )
       ORDER BY points ASC`,
      [studentDomain, studentEmail, studentName]
    );

    const [claims] = await pool.query('SELECT * FROM student_reward_claims WHERE student_email = ? ORDER BY created_at DESC', [studentEmail]);

    const mappedClaims = claims.map((c) => ({
      id: c.claim_code,
      title: c.reward_title,
      pointsUsed: c.points_used,
      claimedAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-07-23',
      status: c.status,
      trackingNo: c.tracking_no
    }));

    const mappedGifts = gifts.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      points: g.points,
      imageIcon: g.image_icon || '🎁',
      bgGradient: g.bg_gradient || 'from-purple-600 to-indigo-600',
      description: g.description,
      inStock: Boolean(g.in_stock),
      popular: Boolean(g.popular),
      filePath: g.file_path,
      resourceUrl: g.resource_url,
      targetType: g.target_type,
      targetValue: g.target_value
    }));

    res.json({
      points: calculatedPoints,
      gifts: mappedGifts,
      claimed: mappedClaims
    });
  } catch (error) {
    console.error('Error fetching student gifts:', error);
    res.status(500).json({ error: 'Failed to fetch gifts data' });
  }
});

// Student: Claim a Reward
app.post('/api/student/gifts/claim', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    const { giftId, address, phone } = req.body;

    const [rewards] = await pool.query('SELECT * FROM student_rewards WHERE id = ?', [giftId]);
    if (rewards.length === 0) {
      return res.status(404).json({ error: 'Reward item not found' });
    }

    const reward = rewards[0];
    const [studentInfo] = await pool.query('SELECT email FROM internships WHERE id = ?', [req.user.id]);
    const studentEmail = studentInfo[0]?.email || req.user.email || 'student@mira.com';
    const claimCode = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

    await pool.query(
      `INSERT INTO student_reward_claims 
       (claim_code, student_email, reward_id, reward_title, points_used, address, phone, status, tracking_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        claimCode,
        studentEmail,
        reward.id,
        reward.title,
        reward.points,
        address || '',
        phone || '',
        'Processing',
        'ORD-PENDING'
      ]
    );

    res.json({ message: 'Reward claimed successfully', claim_code: claimCode });
  } catch (error) {
    console.error('Error claiming gift:', error);
    res.status(500).json({ error: 'Failed to submit claim request' });
  }
});

// Student: Get Resources (PDFs, Application Links, Starter Kits)
app.get('/api/student/resources', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
    
    const studentId = req.user.id;
    const [studentInfo] = await pool.query('SELECT email, domain, full_name FROM internships WHERE id = ?', [studentId]);
    const studentEmail = studentInfo[0]?.email || '';
    const studentDomain = studentInfo[0]?.domain || '';
    const studentName = studentInfo[0]?.full_name || '';

    const [rows] = await pool.query(
      `SELECT * FROM student_rewards 
       WHERE (type IN ('Resource PDF', 'Application Link', 'Goodies Notification') 
          OR category IN ('Starter Kits', 'Documentation & Guides', 'Design & UI', 'Career & Interview'))
         AND (
           target_type = 'All' 
           OR target_value = 'All'
           OR (target_type = 'Department' AND LOWER(?) LIKE LOWER(CONCAT('%', target_value, '%')))
           OR (target_type = 'Student' AND (LOWER(target_value) = LOWER(?) OR LOWER(target_value) = LOWER(?)))
         )
       ORDER BY created_at DESC`,
      [studentDomain, studentEmail, studentName]
    );

    const formattedResources = rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      type: r.type,
      format: r.file_path ? 'PDF File' : 'Web Link',
      readTime: 'Direct Resource',
      description: r.description,
      url: r.file_path || r.resource_url || '#',
      author: 'Mira Tech Admin',
      tags: [r.category, r.type],
      featured: Boolean(r.popular),
      downloads: Math.floor(150 + Math.random() * 300)
    }));

    res.json(formattedResources);
  } catch (error) {
    console.error('Error fetching student resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

