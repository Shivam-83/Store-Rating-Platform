# 🏪 Store Rating Platform

A comprehensive full-stack web application that allows users to submit ratings for stores registered on the platform. Built with Express.js, SQLite, and React.js with Material-UI.

![Store Rating Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![React](https://img.shields.io/badge/React-18-blue)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue)

## ✨ Features

### 👥 User Roles
- **🔧 System Administrator**: Manage users, stores, and view analytics
- **👤 Normal User**: Browse stores, submit ratings, and manage profile  
- **🏪 Store Owner**: View store analytics and customer feedback

### 🚀 Core Functionality
- **🔐 Authentication**: JWT-based login system with role-based access control
- **🏪 Store Management**: Add, view, and search stores
- **⭐ Rating System**: Submit and modify ratings (1-5 scale)
- **📊 Dashboard Analytics**: Role-specific dashboards with insights
- **👥 User Management**: Admin can create and manage users
- **🔍 Search & Filter**: Advanced filtering and sorting capabilities

## 🛠️ Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: SQLite with PostgreSQL compatibility layer
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcrypt, helmet, CORS, rate limiting

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Environment**: Development and Production configurations

## 📋 Prerequisites

Before running this application, make sure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

For Docker deployment (optional):
- **Docker** - [Download here](https://www.docker.com/)
- **Docker Compose** - Usually included with Docker

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/store-rating-platform.git
cd store-rating-platform
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Go back to project root
cd ..

# Set up clean database
node setup-clean-db.js
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Run the Application

**Start both servers (recommended):**

```bash
# Terminal 1 - Backend (from project root)
cd backend
npm start

# Terminal 2 - Frontend (from project root)  
cd frontend
npm start
```

### 5. Access the Application
- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:5000

## 🎯 How to Use

### 👤 For Normal Users
1. **Sign Up**: Go to http://localhost:3000/signup and create account with "Normal User" role
2. **Browse Stores**: View all registered stores with their ratings
3. **Search**: Use search bar to filter stores by name and address
4. **Rate Stores**: Click on any store to submit a rating (1-5 stars)
5. **Update Password**: Access profile settings to change password

### 🏪 For Store Owners  
1. **Sign Up**: Create account with "Store Owner" role
2. **Dashboard**: View your store's performance analytics
3. **Customer Feedback**: See detailed ratings and customer reviews
4. **Track Performance**: Monitor average ratings over time

### 🔧 For System Administrators
1. **Sign Up**: Create account with "System Administrator" role
2. **User Management**: Create, view, and manage all platform users
3. **Store Management**: Add new stores and assign owners
4. **Platform Analytics**: View comprehensive statistics and insights

## 🐳 Docker Deployment (Alternative)

For easy deployment using Docker:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at http://localhost:3000

## 🔧 Configuration

The application works out of the box with default settings. For customization, check the `.env` files:

### Backend Configuration (`backend/.env`)
```env
# Database
DB_PATH=./database/store_rating.db
USE_MOCK_DB=false

# Security
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development
```

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup    # User registration
POST /api/auth/login     # User login
```

### Store Endpoints
```
GET  /api/stores         # Get all stores (with search/filter)
POST /api/stores         # Create store (Admin only)
GET  /api/stores/:id     # Get store details
```

### Rating Endpoints
```
POST /api/ratings/:storeId    # Submit rating
PUT  /api/ratings/:storeId    # Update rating
GET  /api/ratings/:storeId    # Get user's rating
```

### User Management
```
GET  /api/users              # Get all users (Admin only)
POST /api/users              # Create user (Admin only)
PUT  /api/users/password     # Update password
```

## 🗂️ Project Structure

```
store-rating-platform/
├── 📁 backend/
│   ├── 📁 config/          # Database configuration
│   ├── 📁 middleware/      # Auth & validation
│   ├── 📁 routes/          # API endpoints
│   ├── 📁 database/        # SQLite database
│   └── 📄 server.js        # Main server file
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # React components
│   │   ├── 📁 pages/       # Page components
│   │   └── 📁 contexts/    # React contexts
│   └── 📄 package.json
├── 📄 docker-compose.yml   # Docker setup
├── 📄 setup-clean-db.js    # Database setup
└── 📄 README.md            # This file
```

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt
- ✅ **Input Validation** - Comprehensive validation
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **CORS Protection** - Cross-origin security
- ✅ **Rate Limiting** - API abuse prevention

## 🧪 Testing

Test the API endpoints:
```bash
cd backend
node test-api.js
```

## 🆘 Troubleshooting

### Common Issues & Solutions

**❌ Port already in use:**
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 5000
```

**❌ Database issues:**
```bash
# Reset database
node setup-clean-db.js
```

**❌ Module not found:**
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

**❌ Can't connect to backend:**
- Ensure backend is running on port 5000
- Check console for error messages
- Verify `.env` configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- 🐛 **Issues**: [Create an issue](https://github.com/yourusername/store-rating-platform/issues)
- 📖 **Documentation**: Check this README
- 💬 **Questions**: Use GitHub Discussions

---

**⭐ If you find this project helpful, please give it a star!**

**Built with ❤️ using Express.js, React.js, and SQLite**
