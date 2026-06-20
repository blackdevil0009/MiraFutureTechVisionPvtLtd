# Deployment Guide - Mira Future Tech Internship Form

## 🌐 Deploying to Production

This guide covers deploying the application to cloud platforms.

---

## Frontend Deployment (React)

### Option 1: Vercel (Recommended - Easiest)

**Steps:**
1. Create account at https://vercel.com
2. Connect your GitHub repository
3. Set environment variables:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   REACT_APP_API_BASE=https://your-api-domain.com
   ```
4. Deploy automatically on every push

**Build Command:** `npm run build`

**Output Directory:** `dist` or `build`

---

### Option 2: Netlify

**Steps:**
1. Create account at https://netlify.com
2. Connect GitHub or drag & drop folder
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

---

### Option 3: AWS S3 + CloudFront

**Steps:**
```bash
# Build for production
npm run build

# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Create CloudFront distribution
# Use S3 bucket as origin
```

---

## Backend Deployment (FastAPI)

### Option 1: Railway.app (Recommended)

**Steps:**
1. Create account at https://railway.app
2. Connect GitHub repository
3. Create new project and select Python
4. Set environment variables:
   ```
   DATABASE_URL=sqlite:///./internship_applications.db
   CORS_ORIGINS=https://your-frontend-domain.com
   ```
5. Deploy automatically

**Procfile (create in backend root):**
```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

---

### Option 2: Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add Procfile to backend:
   ```
   web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```
5. Set environment variables:
   ```bash
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.com
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```

---

### Option 3: DigitalOcean App Platform

**Steps:**
1. Create account at https://www.digitalocean.com/
2. Create new App
3. Connect GitHub repository
4. Configure build settings:
   - Build command: `pip install -r requirements.txt`
   - Run command: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
5. Set environment variables
6. Deploy

---

## Database Deployment

### Option 1: SQLite (Current - for small scale)

Keep using SQLite. It works for small to medium traffic.

**Backup locally:**
```bash
python -c "
import shutil
import datetime
timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy('internship_applications.db', f'backup_{timestamp}.db')
print(f'Backup created: backup_{timestamp}.db')
"
```

---

### Option 2: MySQL on Cloud

If traffic grows, migrate to MySQL:

**Install MySQL driver:**
```bash
pip install PyMySQL
```

**Update connection string in main.py:**
```python
import pymysql
import sqlalchemy

DATABASE_URL = "mysql+pymysql://user:password@host:3306/dbname"
```

**Services offering MySQL:**
- AWS RDS
- DigitalOcean Managed Databases
- PlanetScale
- Heroku Postgres (alternative)

---

### Option 3: MongoDB on Atlas

For NoSQL approach:

```bash
pip install pymongo motor
```

**Create cluster at:** https://www.mongodb.com/cloud/atlas

---

## Pre-Deployment Checklist

- [ ] Update `CORS_ORIGINS` in backend `.env`
- [ ] Set `REACT_APP_API_URL` in frontend `.env`
- [ ] Test locally one final time
- [ ] Remove debug code and console.logs
- [ ] Verify error handling works
- [ ] Test file uploads
- [ ] Update company URLs if needed
- [ ] Set up proper logging
- [ ] Create database backups
- [ ] Document deployment steps

---

## Production Configuration Changes

### Backend (main.py)

**Before pushing:** Update CORS settings

```python
# DEVELOPMENT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    # ...
)

# PRODUCTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    # ...
)
```

### Frontend API Calls

Update `.env` file:

```env
# Local
REACT_APP_API_URL=http://localhost:8000/api

# Production
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Monitoring & Logging

### Backend Logs

```bash
# View logs on Railway
railway logs

# View logs on Heroku
heroku logs --tail

# View logs on DigitalOcean
# Check in Dashboard > Monitoring
```

### Error Tracking (Optional)

Add Sentry for error monitoring:

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=0.1,
)
```

---

## Database Backups

### Automated with Schedule

```python
# In backend, add cron job
import schedule
import shutil
import datetime

def backup_database():
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    shutil.copy('internship_applications.db', f'backups/backup_{timestamp}.db')

schedule.every().day.at("02:00").do(backup_database)
```

---

## SSL/HTTPS Setup

### For Custom Domain

1. **Get SSL certificate** (Let's Encrypt - Free)
2. **Configure on your platform:**
   - Vercel: Automatic
   - Railway: Automatic
   - Custom server: Use Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com
```

---

## Performance Optimization

### Frontend

```bash
# Enable gzip compression
npm run build  # Already optimized

# Minimize bundle size
npm run build -- --analyze
```

### Backend

```bash
# Use production ASGI server
pip install gunicorn

# Run with multiple workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Database

```sql
-- Already has indexes created:
CREATE INDEX idx_email ON applications(email);
CREATE INDEX idx_domain ON applications(domain);
CREATE INDEX idx_created_at ON applications(created_at DESC);
```

---

## Scaling Strategy

**Phase 1:** SQLite + Shared Hosting
- Good for: < 100 applications/month

**Phase 2:** MySQL + Single Server
- Good for: 100-1000 applications/month

**Phase 3:** MySQL + Load Balancer + CDN
- Good for: 1000+ applications/month

**Phase 4:** Microservices + Kubernetes
- For high-scale enterprise

---

## Troubleshooting Production Issues

### Issue: "502 Bad Gateway"
- Check backend server logs
- Verify CORS settings
- Restart application

### Issue: "CORS Error"
- Verify frontend domain in `CORS_ORIGINS`
- Check API URL in frontend `.env`
- Clear browser cache

### Issue: "Database Locked"
- Stop application
- Backup database
- Restart application

### Issue: "Timeout on File Upload"
- Increase timeout settings
- Check file size
- Verify disk space

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor database size

**Monthly:**
- Backup database
- Review application submissions
- Update dependencies: `pip list --outdated`

**Quarterly:**
- Security audit
- Performance review
- Dependency updates

---

## Support & Resources

**Deployment Help:**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/
- React Build: https://create-react-app.dev/deployment/

---

## Cost Estimation

**Free Tier Options:**
- Frontend: Vercel (free)
- Backend: Railway (free tier)
- Domain: Free with many services

**Paid Options:**
- Railway: ~$5/month
- DigitalOcean: ~$5/month
- AWS: Pay-as-you-go

**Total Cost:** $0-20/month for small businesses

---

**Ready to go live? 🚀**

Choose your platform and deploy!
