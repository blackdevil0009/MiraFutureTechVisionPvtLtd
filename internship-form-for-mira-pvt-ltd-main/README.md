# Internship Application Form - Complete Setup Guide

**Company:** Mira Future Tech Pvt Ltd  
**Tech Stack:** React.js, FastAPI, SQLite  
**Created:** 2024

---

## 📋 Project Overview

This is a professional internship application system featuring:
- ✅ Modern React frontend with Tailwind CSS
- ✅ FastAPI backend with file upload support
- ✅ SQLite database for application storage
- ✅ Form validation and error handling
- ✅ Responsive design for all devices
- ✅ Security features (input sanitization, file validation, CORS)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- VS Code (recommended)

---

## 📦 Backend Setup (FastAPI)

### Step 1: Open Terminal and Navigate to Backend
```bash
cd c:\Users\moham\OneDrive\Desktop\internship\backend
```

### Step 2: Create Virtual Environment
```bash
# On Windows
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Backend Server
```bash
python main.py
```

**Expected Output:**
```
Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

✅ Backend will be available at: `http://localhost:8000`

---

## 🎨 Frontend Setup (React)

### Step 1: Open New Terminal and Navigate to Frontend
```bash
cd c:\Users\moham\OneDrive\Desktop\internship\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create .env file (if not already created)
```bash
# .env should already exist with:
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_BASE=http://localhost:8000
```

### Step 4: Start React Development Server
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view internship-form in the browser.
  http://localhost:3000
```

✅ Frontend will be available at: `http://localhost:3000`

---

## 🔌 API Endpoints

### 1. Submit Application
**POST** `http://localhost:8000/api/apply-internship`

**Request Body (multipart/form-data):**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "college": "IIT Delhi",
  "degree": "B.Tech",
  "branch": "CS",
  "year": "3rd",
  "domain": "Full Stack Development",
  "skills": "Python, React, Node.js, SQL",
  "message": "I'm passionate about web development...",
  "resume": <PDF file>
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": 1,
  "details": {
    "name": "John Doe",
    "email": "john@example.com",
    "domain": "Full Stack Development",
    "submitted_at": "2024-04-20T10:30:00"
  }
}
```

---

### 2. Get All Applications (Admin)
**GET** `http://localhost:8000/api/applications`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "applications": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "college": "IIT Delhi",
      "degree": "B.Tech",
      "branch": "CS",
      "year": "3rd",
      "domain": "Full Stack Development",
      "skills": "Python, React, Node.js",
      "message": "...",
      "resume_path": "uploads/20240420_101530_john_resume.pdf",
      "created_at": "2024-04-20 10:15:30"
    }
  ]
}
```

---

### 3. Get Specific Application
**GET** `http://localhost:8000/api/applications/{id}`

**Response:**
```json
{
  "success": true,
  "application": { /* application details */ }
}
```

---

### 4. Health Check
**GET** `http://localhost:8000/api/health`

---

## 📂 Project Structure

```
internship/
├── frontend/
│   ├── InternshipForm.jsx          # Main React component
│   ├── index.jsx                    # Entry point
│   ├── index.css                    # Global styles
│   ├── package.json                 # Dependencies
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── tailwind.config.mjs          # Alternative config
│   ├── .env                         # Environment variables
│   └── public/
│       └── index.html               # HTML template
│
├── backend/
│   ├── main.py                      # FastAPI application
│   ├── requirements.txt             # Python dependencies
│   ├── schema.sql                   # Database schema
│   ├── .env                         # Environment variables
│   └── uploads/                     # Resume storage directory
│
└── README.md                        # This file
```

---

## 🔒 Security Features

✅ **Input Validation:**
- Email format validation
- Phone number validation (10-15 digits)
- Required field checks

✅ **File Security:**
- Only PDF files allowed
- Maximum file size: 5MB
- Unique filename with timestamp

✅ **Input Sanitization:**
- SQL injection prevention
- XSS prevention through React escaping
- Text length limits

✅ **CORS Protection:**
- Configured for localhost:3000 and localhost:8000
- Can be extended for production domains

---

## 📊 Database Schema

### Table: `applications`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| name | TEXT | Full name of applicant |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| college | TEXT | College name |
| degree | TEXT | Degree type (B.Tech, BCA, etc.) |
| branch | TEXT | Branch (CS, IT, AI, etc.) |
| year | TEXT | Year of study (1st, 2nd, 3rd, 4th) |
| domain | TEXT | Preferred internship domain |
| skills | TEXT | Comma-separated skills |
| message | TEXT | Why they want the internship |
| resume_path | TEXT | Path to uploaded resume PDF |
| created_at | TIMESTAMP | Application submission time |

**Indexes:**
- `idx_email` on email
- `idx_college` on college
- `idx_domain` on domain
- `idx_created_at` on created_at (DESC)

---

## 🧪 Testing the Application

### Test 1: Happy Path (Successful Submission)
1. Open http://localhost:3000
2. Fill all fields correctly
3. Upload a valid PDF resume
4. Click "Submit Application"
5. ✅ Should see success message

### Test 2: Validation Test (Invalid Email)
1. Enter invalid email (e.g., "invalidemail")
2. Try to submit
3. ✅ Should see error message

### Test 3: File Upload Test (Wrong File Type)
1. Try to upload a .txt or .jpg file
2. ✅ Should show "Only PDF files are allowed"

### Test 4: Check Database
Use DB Browser for SQLite (optional tool) to verify data:
```bash
# Or use SQLite CLI:
sqlite3 internship_applications.db
sqlite> SELECT COUNT(*) FROM applications;
sqlite> SELECT name, email, created_at FROM applications;
```

---

## 🌐 Frontend Features

### Form Fields
- Full Name (text input)
- Email Address (email input with validation)
- Phone Number (tel input)
- College Name (text input)
- Degree (dropdown)
- Branch (dropdown)
- Year of Study (dropdown)
- Preferred Domain (dropdown with 10 options)
- Skills (textarea for comma-separated values)
- Resume Upload (PDF only, max 5MB)
- Why do you want this internship? (textarea)

### UI Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading spinner during submission
- ✅ Success/error alert messages
- ✅ Clean, professional layout with company branding
- ✅ Form validation with user-friendly error messages
- ✅ Tailwind CSS styling for modern appearance

---

## 🔄 API Integration in React

The React component uses **Axios** to communicate with the backend:

```javascript
// Example: Submitting form data with file
const submitData = new FormData();
submitData.append('fullName', formData.fullName);
submitData.append('resume', formData.resume);

const response = await axios.post(
  'http://localhost:8000/api/apply-internship',
  submitData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);
```

---

## 🚀 Production Deployment

### Backend (FastAPI)
```bash
# Use Gunicorn or similar for production
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend (React)
```bash
# Build for production
npm run build

# Output will be in `build/` folder
# Deploy using Vercel, Netlify, or Apache/Nginx
```

### Important Changes for Production:
1. Update CORS origins in `main.py`:
```python
allow_origins=["https://yourdomain.com"]
```

2. Update API URL in React `.env`:
```
REACT_APP_API_URL=https://your-api-domain.com/api
```

3. Use environment variables for sensitive data
4. Add HTTPS
5. Set up database backups
6. Enable authentication for admin endpoints

---

## 🛠️ Troubleshooting

### Issue: "Connection refused" on port 8000
- ✅ Ensure backend is running: `python main.py`
- ✅ Check if port 8000 is already in use

### Issue: "CORS Error"
- ✅ Ensure backend is running
- ✅ Check frontend URL matches CORS configuration
- ✅ Clear browser cache

### Issue: "File upload fails"
- ✅ Ensure uploads folder exists
- ✅ Check file is PDF format
- ✅ Check file size < 5MB

### Issue: Database errors
- ✅ Delete `internship_applications.db` to reset
- ✅ Backend will recreate it on restart

---

## 📧 Future Enhancements

1. **Email Notifications**
   - Send confirmation email to applicants
   - Send admin notification on new application

2. **Admin Dashboard**
   - View all applications
   - Filter/search applications
   - Download resumes
   - Update application status

3. **Authentication**
   - JWT tokens for admin access
   - User login for applicants to track status

4. **Advanced Validation**
   - Phone number country code detection
   - College name validation against database
   - Plagiarism detection for reason text

5. **Payments** (if premium edition)
   - Stripe integration for paid internships

---

## 📝 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_BASE=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./internship_applications.db
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review logs in browser console (F12)
3. Check terminal output for backend errors
4. Verify all prerequisites are installed

---

## 📄 License

© 2024 Mira Future Tech Pvt Ltd. All rights reserved.

---

## 🎯 Next Steps

1. ✅ Run backend: `python main.py`
2. ✅ Run frontend: `npm start`
3. ✅ Open http://localhost:3000
4. ✅ Test the form
5. ✅ View submissions in database

**Total Setup Time: 5-10 minutes**

Happy coding! 🚀
