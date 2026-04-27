# 🚀 QUICK START GUIDE - 5 Minutes to Launch!

**Mira Future Tech Pvt Ltd - Internship Application Form**

---

## ⚡ Prerequisites (1 minute)

✅ Verify you have:
- **Python 3.8+** → Open CMD/Terminal and type: `python --version`
- **Node.js 14+** → Type: `node --version`
- **Git** (optional) → Type: `git --version`

If any are missing, install from:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

---

## 🎯 Step 1: Backend Setup (2 minutes)

### In VS Code Terminal (or CMD):

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# OR Activate it (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

**Success when you see:**
```
Uvicorn running on http://127.0.0.1:8000
Application startup complete
```

✅ **Backend is LIVE at: http://localhost:8000**

Keep this terminal open!

---

## 🎨 Step 2: Frontend Setup (2 minutes)

### In NEW VS Code Terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies  
npm install

# Start development server
npm start
```

**Success when browser opens automatically or shows:**
```
Compiled successfully!
You can now view internship-form in the browser
Local: http://localhost:3000
```

✅ **Frontend is LIVE at: http://localhost:3000**

---

## ✅ Test It! (Instant)

1. **Open**: http://localhost:3000
2. **Fill the form** with test data:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - College: IIT Delhi
   - Skills: Python, React, Node.js
   - Message: I'm interested in learning!
3. **Upload**: Any PDF file (< 5MB)
4. **Click**: Submit Application
5. **See**: Success message! 🎉

---

## 🗂️ Verify Everything Works

### Check Backend:
```bash
# Open new terminal tab
curl http://localhost:8000/api/health
```

Should return:
```json
{"status": "healthy", "timestamp": "2024-04-20T..."}
```

### Check Database:
```bash
# Open new terminal in backend folder (venv activated)
sqlite3 internship_applications.db
sqlite> SELECT COUNT(*) FROM applications;
sqlite> SELECT * FROM applications;
```

---

## 🛑 Troubleshooting - Common Issues

### Issue: "Port 8000 already in use"
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill it and restart
taskkill /PID <PID> /F
```

### Issue: "Module not found" (Python)
```bash
# Make sure venv is activated
venv\Scripts\activate

# Reinstall
pip install -r requirements.txt
```

### Issue: "npm not found"
- Reinstall Node.js from https://nodejs.org/
- Restart Terminal after installation

### Issue: CORS Error
- Ensure backend is running on http://localhost:8000
- Clear browser cache (Ctrl+Shift+Delete)
- Restart both servers

---

## 📂 Project Structure

```
internship/
├── backend/
│   ├── main.py                    ← FastAPI app
│   ├── requirements.txt           ← Python packages
│   ├── internship_applications.db ← Database (auto-created)
│   └── uploads/                   ← Resumes saved here
│
├── frontend/
│   ├── src/
│   │   ├── InternshipForm.jsx     ← Main component
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json               ← Node packages
│   └── public/
│       └── index.html
│
└── README.md                       ← Full documentation
```

---

## 🎊 What You Built!

✅ **Frontend (React):**
- Clean, professional form UI
- Responsive design (mobile/tablet/desktop)
- Form validation with error messages
- Loading spinner on submit
- Success/error alerts
- Tailwind CSS styling

✅ **Backend (FastAPI):**
- REST API with file upload
- SQLite database
- Input validation & sanitization
- CORS enabled
- Resume storage
- Error handling

✅ **Database (SQLite):**
- Automatic schema creation
- Indexed columns for performance
- Timestamps for tracking

---

## 🚀 Next Steps

1. **Customize the form:**
   - Edit company name in `frontend/src/InternshipForm.jsx`
   - Change colors in Tailwind config
   - Add more domains or branches

2. **Add Email Notifications:**
   - Configure SMTP in backend
   - Send confirmation emails

3. **Build Admin Dashboard:**
   - Create admin panel to view applications
   - Export to CSV
   - Filter by domain

4. **Deploy to Production:**
   - Frontend → Vercel, Netlify
   - Backend → Railway, Heroku, AWS
   - Database → Cloud database

---

## 💡 Key Files to Edit

| File | Purpose |
|------|---------|
| `frontend/src/InternshipForm.jsx` | Form content & styling |
| `backend/main.py` | API routes & logic |
| `frontend/.env` | API endpoints |
| `frontend/tailwind.config.js` | Theme colors |

---

## 📊 API Quick Reference

```bash
# Submit Application
POST http://localhost:8000/api/apply-internship

# Get All Applications
GET http://localhost:8000/api/applications

# Get Single Application
GET http://localhost:8000/api/applications/1

# Health Check
GET http://localhost:8000/api/health
```

---

## 🎯 Success Checklist

- [x] Backend running on :8000
- [x] Frontend running on :3000
- [x] Form displays correctly
- [x] Can fill and submit
- [x] See success message
- [x] Resume file saved
- [x] Data in database

**All Done! 🎉**

---

## 📞 Quick Help

**Backend won't start?**
```bash
pip install fastapi uvicorn python-multipart pydantic
python main.py
```

**Frontend won't start?**
```bash
npm install
npm start
```

**Need to reset database?**
```bash
# Delete database file
del backend\internship_applications.db

# It will recreate on next backend start
python main.py
```

---

## 🌍 Taking It Live

When ready for production:

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Deploy frontend to Vercel/Netlify
# Deploy backend to Railway/Heroku
# Update CORS origins in main.py
```

---

**Built with ❤️ by Your Team**
© 2024 Mira Future Tech Pvt Ltd
