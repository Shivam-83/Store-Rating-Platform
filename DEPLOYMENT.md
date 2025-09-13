# 🚀 Store Rating Platform - Production Deployment Guide

## 📋 Overview
This guide provides comprehensive instructions for deploying the Store Rating Platform in production environments.

## 🏗️ Architecture
- **Frontend**: React 18 with Material-UI (built and served statically)
- **Backend**: Node.js/Express API server
- **Database**: SQLite (file-based, production-ready)
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (optional, for production)

## 🔧 Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- 2GB+ RAM recommended
- 10GB+ disk space

## 🚀 Quick Deployment

### Option 1: One-Click Deployment (Recommended)
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Docker Deployment
```bash
# 1. Initialize database
node setup-sqlite.js

# 2. Build and run with Docker Compose
docker-compose up --build -d

# 3. Check status
docker-compose ps
```

### Option 3: Production with Nginx
```bash
# Run with nginx reverse proxy
docker-compose --profile production up -d
```

## 🌐 Access Points
- **Application**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **With Nginx**: http://localhost (port 80)

## 👤 Default Credentials
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / User123!
- **Store Owner**: owner@example.com / Owner123!

## 🔒 Security Configuration

### Environment Variables (.env.production)
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
DB_PATH=./database/store_rating.db
```

### Security Features
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation & sanitization

## 📊 Monitoring & Health Checks
- Health endpoint: `/health`
- Docker health checks enabled
- Application logs via `docker-compose logs`

## 🔄 Updates & Maintenance
```bash
# Update application
git pull
docker-compose up --build -d

# View logs
docker-compose logs -f

# Backup database
cp database/store_rating.db database/backup_$(date +%Y%m%d).db

# Stop application
docker-compose down
```

## 🌍 Cloud Deployment Options

### AWS ECS/Fargate
1. Push image to ECR
2. Create ECS task definition
3. Deploy to Fargate cluster

### Google Cloud Run
1. Build and push to GCR
2. Deploy to Cloud Run
3. Configure custom domain

### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Deploy automatically

### Heroku
1. Add Heroku buildpack
2. Configure environment variables
3. Deploy via Git

## 📈 Scaling Considerations
- **Database**: Consider PostgreSQL for high-traffic
- **Load Balancing**: Use multiple container instances
- **CDN**: Serve static assets via CDN
- **Caching**: Implement Redis for session storage

## 🛠️ Troubleshooting

### Common Issues
1. **Port conflicts**: Change PORT in .env
2. **Database locked**: Restart container
3. **Build failures**: Clear Docker cache

### Debug Commands
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs store-rating-app

# Access container shell
docker-compose exec store-rating-app sh

# Test database connection
docker-compose exec store-rating-app node -e "console.log(require('./config/database'))"
```

## 📞 Support
For deployment issues or questions, check the application logs and ensure all prerequisites are met.

---
**🎉 Your Store Rating Platform is now production-ready!**
