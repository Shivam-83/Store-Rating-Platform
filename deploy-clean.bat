@echo off
REM Store Rating Platform Clean Deployment Script for Windows
echo 🚀 Starting Clean Store Rating Platform Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create database directory if it doesn't exist
if not exist "database" mkdir database

REM Initialize clean database (no sample data)
echo 🧹 Setting up clean database...
node setup-clean-db.js

REM Build and start the application
echo 🔨 Building and starting the application...
docker-compose up --build -d

REM Wait for the application to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is running
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is running successfully!
    echo 🌐 Access your application at: http://localhost:5000
    echo 📊 Health check: http://localhost:5000/health
    echo 📝 Register new users at: http://localhost:5000/signup
    echo 🧹 Database is clean - ready for fresh data!
) else (
    echo ❌ Application failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo 🎉 Clean deployment completed successfully!
echo 💡 Tip: Use /signup to create your first admin user
pause
