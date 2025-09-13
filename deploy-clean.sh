#!/bin/bash

# Store Rating Platform Clean Deployment Script
echo "🚀 Starting Clean Store Rating Platform Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create database directory if it doesn't exist
mkdir -p database

# Initialize clean database (no sample data)
echo "🧹 Setting up clean database..."
node setup-clean-db.js

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your application at: http://localhost:5000"
    echo "📊 Health check: http://localhost:5000/health"
    echo "📝 Register new users at: http://localhost:5000/signup"
    echo "🧹 Database is clean - ready for fresh data!"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "🎉 Clean deployment completed successfully!"
echo "💡 Tip: Use /signup to create your first admin user"
