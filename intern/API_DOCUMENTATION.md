# Internship Application API Documentation

**Base URL:** `http://localhost:8000`

---

## 1. Submit Application

**Endpoint:** `POST /api/apply-internship`

**Description:** Submit a new internship application with resume

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | Applicant's full name |
| email | string | Yes | Valid email address |
| phone | string | Yes | 10-15 digit phone number |
| college | string | Yes | College name |
| degree | string | Yes | B.Tech, BCA, MCA, B.Sc, M.Sc |
| branch | string | Yes | CS, IT, AI, Data Science, etc. |
| year | string | Yes | 1st, 2nd, 3rd, or 4th |
| domain | string | Yes | Internship domain choice |
| skills | string | Yes | Comma-separated skills |
| message | string | Yes | Why they want internship |
| resume | file | Yes | PDF file (max 5MB) |

**Available Domains:**
- Java Development
- Python Development
- Full Stack Development
- Frontend Development
- Backend Development
- Data Science
- Artificial Intelligence
- Machine Learning
- Cyber Security
- Cloud Computing

**Available Degrees:**
- B.Tech
- BCA
- MCA
- B.Sc
- M.Sc

**Available Branches:**
- CS (Computer Science)
- IT (Information Technology)
- AI (Artificial Intelligence)
- Data Science
- ECE (Electronics)
- Mechanical
- Civil

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": 1,
  "details": {
    "name": "John Doe",
    "email": "john@example.com",
    "domain": "Full Stack Development",
    "submitted_at": "2024-04-20T10:30:45.123456"
  }
}
```

**Error Response (400):**
```json
{
  "detail": "Only PDF files are allowed"
}
```

**Validation Rules:**
- Email must be valid format
- Phone must be 10-15 digits
- Resume must be PDF
- File size must be < 5MB
- All fields are required

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/apply-internship \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=9876543210" \
  -F "college=IIT Delhi" \
  -F "degree=B.Tech" \
  -F "branch=CS" \
  -F "year=3rd" \
  -F "domain=Full Stack Development" \
  -F "skills=Python,React,Node.js,SQL" \
  -F "message=I love coding" \
  -F "resume=@resume.pdf"
```

---

## 2. Get All Applications

**Endpoint:** `GET /api/applications`

**Description:** Retrieve all internship applications (admin access)

**Response (200):**
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
      "message": "I love coding",
      "resume_path": "uploads/20240420_103045_john_resume.pdf",
      "created_at": "2024-04-20 10:30:45"
    }
  ]
}
```

**Example cURL:**
```bash
curl http://localhost:8000/api/applications
```

**Example Axios:**
```javascript
const response = await axios.get('http://localhost:8000/api/applications');
console.log(response.data.applications);
```

---

## 3. Get Single Application

**Endpoint:** `GET /api/applications/{id}`

**Description:** Retrieve a specific application by ID

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Application ID |

**Response (200):**
```json
{
  "success": true,
  "application": {
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
    "message": "I love coding",
    "resume_path": "uploads/20240420_103045_john_resume.pdf",
    "created_at": "2024-04-20 10:30:45"
  }
}
```

**Error Response (404):**
```json
{
  "detail": "Application not found"
}
```

**Example cURL:**
```bash
curl http://localhost:8000/api/applications/1
```

---

## 4. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if API is running

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-04-20T10:30:45.123456"
}
```

**Example cURL:**
```bash
curl http://localhost:8000/api/health
```

---

## 5. Root Endpoint

**Endpoint:** `GET /`

**Description:** Get API information

**Response (200):**
```json
{
  "message": "Mira Future Tech Internship API v1.0"
}
```

---

## Error Codes

| Code | Message |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Not Found (application doesn't exist) |
| 500 | Internal Server Error |

---

## Request Examples

### JavaScript/Node.js

```javascript
import axios from 'axios';

// Submit application
async function submitApplication(formData) {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/apply-internship',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data?.detail);
  }
}

// Get all applications
async function getApplications() {
  try {
    const response = await axios.get('http://localhost:8000/api/applications');
    console.log('Applications:', response.data.applications);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Python

```python
import requests

# Submit application
def submit_application(form_data):
    files = {'resume': open('resume.pdf', 'rb')}
    data = {
        'fullName': 'John Doe',
        'email': 'john@example.com',
        # ... other fields
    }
    response = requests.post(
        'http://localhost:8000/api/apply-internship',
        data=data,
        files=files
    )
    print(response.json())

# Get all applications
def get_applications():
    response = requests.get('http://localhost:8000/api/applications')
    print(response.json())
```

### cURL Commands

```bash
# Submit application
curl -X POST http://localhost:8000/api/apply-internship \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=9876543210" \
  -F "college=IIT Delhi" \
  -F "degree=B.Tech" \
  -F "branch=CS" \
  -F "year=3rd" \
  -F "domain=Full Stack Development" \
  -F "skills=Python,React,Node.js" \
  -F "message=I love coding" \
  -F "resume=@resume.pdf"

# Get all applications
curl http://localhost:8000/api/applications

# Get single application
curl http://localhost:8000/api/applications/1

# Health check
curl http://localhost:8000/api/health
```

---

## Database Queries

### Get count of applications by domain
```sql
SELECT domain, COUNT(*) as count 
FROM applications 
GROUP BY domain 
ORDER BY count DESC;
```

### Get applications from specific college
```sql
SELECT name, email, domain, created_at 
FROM applications 
WHERE college LIKE '%IIT%' 
ORDER BY created_at DESC;
```

### Get last 10 applications
```sql
SELECT * FROM applications 
ORDER BY created_at DESC 
LIMIT 10;
```

### Get applications in date range
```sql
SELECT * FROM applications 
WHERE created_at BETWEEN '2024-04-01' AND '2024-04-30' 
ORDER BY created_at DESC;
```

---

## Rate Limiting

Currently: No rate limiting. Recommended for production.

---

## Authentication

Currently: No authentication required. 

For production, add JWT tokens or API keys.

---

## CORS Configuration

**Allowed Origins:**
- http://localhost:3000
- http://localhost:8000

**Production:** Update in `backend/main.py`

```python
allow_origins=["https://yourdomain.com"]
```

---

## File Upload Specifications

**Allowed Format:** PDF only

**Max Size:** 5MB (5,242,880 bytes)

**Storage Location:** `backend/uploads/`

**Filename Format:** `{timestamp}_{email}_{originalname}`

Example: `20240420_103045_john_resume.pdf`

---

## Response Formats

All responses are JSON:

```json
{
  "success": true/false,
  "message": "...",
  "data": {...}
}
```

---

## Security

✅ Input validation
✅ File type validation
✅ File size limits
✅ SQL injection prevention
✅ XSS prevention
✅ CORS protection

---

**Last Updated:** 2024-04-20
**Version:** 1.0.0
