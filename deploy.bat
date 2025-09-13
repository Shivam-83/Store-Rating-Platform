@echo off
REM Store Rating Platform Deployment Script for Windows
echo 🚀 Starting Store Rating Platform Deployment...

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

REM Initialize database if it doesn't exist
if not exist "database\store_rating.db" (
    echo 📊 Initializing database...
    node setup-sqlite.js
)

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
) else (
    echo ❌ Application failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo 🎉 Deployment completed successfully!
pause
