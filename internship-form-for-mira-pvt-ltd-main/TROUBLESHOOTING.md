# 🆘 Troubleshooting Guide

**Mira Future Tech Internship Application Form**

---

## ⚡ Quick Fixes (Try These First)

### Problem: Form won't load (blank page)

**Solution:**
```bash
# 1. Check both servers are running
# Terminal 1: Backend
python main.py

# Terminal 2: Frontend  
npm start

# 2. Clear browser cache
Ctrl+Shift+Delete → Clear all → Reload

# 3. Check console for errors
Press F12 → Console tab → Look for red errors

# 4. Restart npm
Ctrl+C in frontend terminal
npm start
```

---

### Problem: "localhost:3000 refused to connect"

**Solution:**
```bash
# Frontend not running!

cd frontend
npm start

# Wait for:
# "Compiled successfully!"
# "You can now view internship-form..."
```

---

### Problem: "Cannot POST /api/apply-internship"

**Solution:**
```bash
# Backend not running!

cd backend
# Activate venv first:
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Then start:
python main.py

# Wait for:
# "Uvicorn running on http://127.0.0.1:8000"
```

---

### Problem: CORS Error in Browser

**Error message:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**

**Option 1 - Make sure backend is running:**
```bash
# Terminal 1
cd backend
venv\Scripts\activate
python main.py
```

**Option 2 - Clear browser cache:**
```
Ctrl+Shift+Delete → Clear all → Reload page
```

**Option 3 - Check API URL:**
- Open browser console (F12)
- Check if API requests go to `http://localhost:8000`
- Should see: `POST http://localhost:8000/api/apply-internship`

---

## 🔧 Installation Issues

### Python not recognized

**Error:** `'python' is not recognized as an internal or external command`

**Solution:**
```bash
# 1. Check Python is installed
python --version

# If not installed:
# Download from https://www.python.org/downloads/
# Make sure to CHECK "Add Python to PATH" during installation

# 2. Restart terminal after installing Python

# 3. Try again
python --version
```

---

### npm not recognized

**Error:** `'npm' is not recognized`

**Solution:**
```bash
# 1. Check Node.js is installed
node --version

# If not installed:
# Download from https://nodejs.org/
# Install Node.js

# 2. Restart terminal

# 3. Skip to:
node --version
npm --version
```

---

### "pip: command not found"

**Error after activating venv**

**Solution:**
```bash
# Make sure venv is activated FIRST:

# Windows:
cd backend
venv\Scripts\activate  ← Must see (venv) in terminal

# Then install:
pip install -r requirements.txt

# If still doesn't work:
python -m pip install -r requirements.txt
```

---

### "ModuleNotFoundError: No module named 'fastapi'"

**Error:** After running `python main.py`

**Solution:**
```bash
# venv not activated!

cd backend

# Activate venv:
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies:
pip install -r requirements.txt

# Try again:
python main.py
```

---

## 📁 File Issues

### "File not found: requirements.txt"

**Error:** When running `pip install -r requirements.txt`

**Solution:**
```bash
# 1. Check you're in correct directory
pwd  # Show current directory - should be "...internship/backend"

# 2. List files
ls  # macOS/Linux
dir  # Windows

# 3. If requirements.txt not there, navigate:
cd c:\Users\moham\OneDrive\Desktop\internship\backend
```

---

### "package.json not found"

**Error:** When running `npm install`

**Solution:**
```bash
# Check you're in frontend folder:
pwd  # Should end with ".../internship/frontend"

# Navigate:
cd c:\Users\moham\OneDrive\Desktop\internship\frontend

# Then install:
npm install
```

---

### ".env file not found"

**Error:** API calls fail

**Solution:**
```bash
# 1. Check if .env exists:
ls  # macOS/Linux
dir  # Windows

# 2. If missing, create from example:
# Copy .env.example → .env

# Frontend:
cp frontend\.env.example frontend\.env

# Backend:
cp backend\.env.example backend\.env

# 3. Edit .env with correct values
```

---

## 🌐 API Issues

### Axios Request Hangs / Timeout

**Browser shows:** Spinner keeps spinning

**Console shows:** Network request pending

**Solution:**

**1. Check backend is running:**
```bash
# Terminal should show:
# Uvicorn running on http://127.0.0.1:8000
```

**2. Test endpoint manually:**
```bash
# Open new terminal
curl http://localhost:8000/api/health

# Should respond:
# {"status":"healthy",...}
```

**3. Check API URL:**
```javascript
// In browser console (F12):
// Should be: http://localhost:8000/api/apply-internship
```

---

### "File upload fails"

**Error:** File upload button doesn't work

**Solution:**

**1. Check file is PDF:**
```bash
# Only .pdf files allowed
# Not .doc, .docx, .txt, .jpg, etc.
```

**2. Check file size:**
```bash
# Maximum 5MB
# If larger, use: https://smallpdf.com/compress-pdf
```

**3. Check console for errors:**
- F12 → Console
- Look for error messages
- Tell backend you need bigger limit

---

### "Database locked" Error

**Error in terminal:** `database is locked`

**Solution:**
```bash
# 1. Stop backend:
Ctrl+C in backend terminal

# 2. Delete database (it will recreate):
del backend\internship_applications.db

# 3. Restart:
python main.py
```

---

## 📊 Form Issues

### Form won't submit

**Button click does nothing**

**Solution:**

**1. Check validation:**
- Fill ALL required fields (marked with *)
- Email must have @ symbol
- Phone must be 10-15 digits
- Resume must be PDF

**2. Check browser console:**
- F12 → Console
- Look for error messages

**3. Reload page:**
```bash
Ctrl+R  # Reload
Ctrl+Shift+R  # Hard reload
```

---

### "Only PDF files are allowed"

**Error:** Upload shows this message

**Solution:**
- File selected is not PDF
- Click upload → choose PDF file
- Supported types: `.pdf` only

---

### "File size must be less than 5MB"

**Error:** When uploading resume

**Solution:**
1. Compress PDF: https://smallpdf.com/compress-pdf
2. Reduce size below 5MB
3. Try uploading again

---

### Email validation error

**Error:** "Please enter a valid email address"

**Solution:**
- Email must have @ symbol
- Email must be: `name@domain.com`
- Not valid: `nameatdomain.com` or `@domain.com`

---

### Phone validation error

**Error:** "Please enter a valid phone number"

**Solution:**
- Phone must be 10-15 digits
- No spaces or dashes
- Text for help: ❌ +1-234-567-8900
- Text format: ✅ 12345678900

---

## 🗄️ Database Issues

### "Table 'applications' doesn't exist"

**Error:** After submitting form

**Solution:**
```bash
# Backend will create table automatically
# But if error persists:

# 1. Stop backend (Ctrl+C)

# 2. Delete database:
del backend\internship_applications.db

# 3. Restart backend:
python main.py

# Table will auto-create
```

---

### Can't view applications

**Can't access:** `http://localhost:8000/api/applications`

**Solution:**

**1. Backend must be running:**
```bash
python main.py
```

**2. Try in browser:**
```
http://localhost:8000/api/applications
```

**3. Or use curl:**
```bash
curl http://localhost:8000/api/applications
```

**4. Or use Postman:**
- Download Postman
- Create GET request
- URL: http://localhost:8000/api/applications
- Send

---

## 🚀 Performance Issues

### Everything is slow

**Solution:**

**1. Close other applications** to free RAM

**2. Restart services:**
```bash
# Terminal 1:
Ctrl+C  # Stop backend

# Terminal 2:
Ctrl+C  # Stop frontend

# 1-2 minute wait

# Restart backend:
python main.py

# Restart frontend:
npm start
```

**3. Check resources:**
```bash
# Windows:
# Open Task Manager → Processes
# Look for high CPU/Memory usage

# Close unnecessary apps
```

---

### Port already in use

**Error:** `Address already in use`

**For Port 8000 (Backend):**
```bash
# Windows:
netstat -ano | findstr :8000
# Then kill: taskkill /PID <number> /F

# macOS/Linux:
lsof -i :8000
# Then kill: kill -9 <PID>

# Or change port in main.py:
# Change: uvicorn.run(..., port=8001)
```

**For Port 3000 (Frontend):**
```bash
# Windows:
netstat -ano | findstr :3000

# Close the process
```

---

## 🐛 Browser Console Errors

### "Cannot find module..."

**Solution:**
```bash
# Dependencies missing
cd frontend
npm install
```

---

### "ReactDOM is not defined"

**Solution:**
```bash
# React not installed
npm install react react-dom
```

---

### "Axios is not defined"

**Solution:**
```bash
# Axios not installed
npm install axios
```

---

## 🔍 Advanced Troubleshooting

### Enable Debug Mode

**Frontend:**
```javascript
// Add to InternshipForm.jsx top:
console.log('Form loaded');
console.log('API URL:', process.env.REACT_APP_API_URL);

// Add before API call:
console.log('Submitting:', submitData);
```

**Backend:**
```python
# Add to main.py:
import logging
logging.basicConfig(level=logging.DEBUG)

# Add before request:
print(f"Received: {fullName}, {email}")
```

---

### Check Network Requests

**In Browser:**
1. Press F12
2. Click "Network" tab
3. Fill form and submit
4. Click the POST request
5. Check:
   - URL
   - Status (should be 200)
   - Request body
   - Response body

---

### Check Database Directly

**View stored data:**
```bash
# In new terminal (backend folder):
sqlite3 internship_applications.db

# Then type:
sqlite> SELECT * FROM applications;
sqlite> SELECT COUNT(*) FROM applications;

# Exit:
sqlite> .exit
```

---

## 📞 Getting Help

### Still stuck? Try:

1. **Google the error message** - Often has solutions
2. **Check official docs:**
   - React: https://react.dev
   - FastAPI: https://fastapi.tiangolo.com
   - SQLite: https://www.sqlite.org/docs.html
3. **Ask on forums:**
   - Stack Overflow
   - Reddit r/reactjs
   - Reddit r/learnprogramming

---

## ✅ Verification Checklist

Before giving up, verify:

- [ ] Python 3.8+ installed: `python --version`
- [ ] Node.js 14+ installed: `node --version`
- [ ] Backend venv created: `venv/Scripts/activate`
- [ ] Backend dependencies: `pip install -r requirements.txt`
- [ ] Backend running: See "Uvicorn running..."
- [ ] Frontend dependencies: `npm install`
- [ ] Frontend running: Browser shows form
- [ ] Both ports available: 3000 and 8000
- [ ] .env files exist: frontend/.env and backend/.env
- [ ] Database file creating: `backend/internship_applications.db`

---

## 💡 Common Patterns

### When to restart each:

**Restart Backend if:**
- Installing new Python package
- Changing environment variables (`backend/.env`)
- File upload not working
- Database errors

**Restart Frontend if:**
- Installing new npm package
- Changing environment variables (`frontend/.env`)
- UI not updating
- API URL changed

---

## 📝 Debugging Workflow

1. **Open two terminals side-by-side**
2. **Terminal 1:** Run backend with `python main.py`
3. **Terminal 2:** Run frontend with `npm start`
4. **Browser:** Open http://localhost:3000
5. **Developer Tools:** Press F12 → Console
6. **Fill form** carefully
7. **Submit** and watch console
8. **Check both terminals** for error messages
9. **Screenshot errors** and search online

---

## 🎯 Most Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Blank page | Restart npm, clear cache |
| Can't connect to backend | Start python main.py |
| CORS error | Clear cache, confirm backend running |
| Form won't submit | Fill all required fields |
| Can't upload file | Use PDF only, < 5MB |
| No data in database | Run form submission |
| npm not found | Install Node.js |
| Python not found | Install Python 3.8+ |
| venv not activating | Use: `venv\Scripts\activate` |
| pip install fails | Run from backend folder in venv |

---

## 🔄 The Nuclear Option

**If everything breaks:**

```bash
# 1. Stop everything:
# Ctrl+C in all terminals

# 2. Remove venv:
rmdir backend\venv /s

# 3. Clear npm cache:
npm cache clean --force

# 4. Remove node_modules:
rmdir frontend\node_modules /s

# 5. Delete database:
del backend\internship_applications.db

# 6. Start fresh:
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 7. New terminal:
cd frontend
npm install

# 8. Run:
# Terminal 1: python main.py
# Terminal 2: npm start
```

---

**Still need help? Check README.md or PROJECT_SUMMARY.md!** 🚀
