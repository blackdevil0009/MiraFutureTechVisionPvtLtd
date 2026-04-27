require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());


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
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    if (!user.password) {
      return res.status(400).json({ error: 'Please login using Google' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: String(error) });
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

// Get all internships (Admin only)
app.get('/api/internships', authenticateToken, async (req, res) => {
  try {
    const [internships] = await pool.query('SELECT * FROM internships ORDER BY created_at DESC');
    res.json(internships);
  } catch (error) {
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

    const token = jwt.sign({ id: user.id, email: user.email, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, designation: user.designation } });
  } catch (error) {
    res.status(500).json({ error: String(error) });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
