# 📚 Express Learning Project - Complete Documentation Hub

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

**A comprehensive Express.js application with advanced authentication, MongoDB integration, and hierarchical admin management system.**

---

## 🎯 Quick Navigation

| Section                       | Description                                | Link                                                               |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| 🏠 **Project Overview**       | Main project introduction and setup        | [README.md](./README.md)                                           |
| 🚀 **Getting Started**        | Installation, setup, and quick start guide | [⬇️ Quick Start](#-quick-start)                                    |
| 🔐 **Authentication System**  | Multi-tier JWT authentication flow         | [⬇️ Authentication](#-authentication-system)                       |
| 👑 **Super Admin Guide**      | Complete super admin management            | [docs/SUPER_ADMIN.md](./docs/SUPER_ADMIN.md)                       |
| 📖 **API Documentation**      | Complete API reference with examples       | [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)           |
| 🗄️ **Database Documentation** | Complete MongoDB schema & operations       | [docs/DATABASE_DOCUMENTATION.md](./docs/DATABASE_DOCUMENTATION.md) |
| 🧪 **Testing Guide**          | Comprehensive testing procedures           | [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)                   |
| 🚀 **Deployment Guide**       | Production deployment procedures           | [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)             |
| 🛠️ **Scripts & CLI Tools**    | Management scripts and automation          | [⬇️ Scripts](#%EF%B8%8F-scripts--cli-tools)                        |
| 🔧 **Development**            | Development workflow and contributing      | [⬇️ Development](#-development)                                    |

---

## 🏗️ **System Architecture Overview**

```mermaid
graph TB
    subgraph "Authentication Flow"
        A[Admin Login] --> B[JWT Token 24h]
        B --> C[Library Token Creation]
        C --> D[Device Authentication]
        D --> E[API Access 5min JWT]
    end

    subgraph "Super Admin System"
        SA[Super Admin] --> AM[Admin Management]
        SA --> ST[System Statistics]
        SA --> PR[Privilege Control]
    end

    subgraph "API Layer"
        E --> API1[Network Info APIs]
        E --> API2[Device Management]
        B --> API3[Admin Operations]
    end
```

---

## 🚀 **Quick Start**

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **MongoDB**: Local installation or MongoDB Atlas
- **npm**: v8.0.0 or higher

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Basic_node_structure

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/express_learning
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
JWT_EXPIRES_IN=24h

# Server Configuration
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=info
```

### 3. Database Setup

```bash
# Start MongoDB (if local)
mongod

# The application will automatically create collections on first run
```

### 4. Create Super Admin

```bash
# Interactive super admin creation
npm run create-superadmin

# Follow the prompts:
# - Enter email address
# - Enter secure password (12+ chars, mixed case, numbers, symbols)
# - Confirm password
```

### 5. Start Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Verify Setup

- **Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api-docs
- **Super Admin Management**: `npm run manage-superadmin`

---

## 🔐 **Authentication System**

### Multi-Tier Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Login   │───▶│ Library Token   │───▶│ Device Auth     │───▶│ API Access      │
│                 │    │ Generation      │    │                 │    │                 │
│ POST /api/admin │    │ POST /api/admin │    │ POST /device    │    │ /api/network-   │
│ /verify         │    │ /library-token  │    │ /auth           │    │ info/*          │
│                 │    │                 │    │                 │    │                 │
│ Returns: Admin  │    │ Returns: 32-char│    │ Returns: Device │    │ Requires: Device│
│ JWT (24h)       │    │ Hash Token      │    │ JWT (5min)      │    │ JWT Token       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Types

| Type              | Duration  | Purpose                   | Usage                          |
| ----------------- | --------- | ------------------------- | ------------------------------ |
| **Admin JWT**     | 24 hours  | Administrative operations | API management, token creation |
| **Library Token** | 30 days   | Device registration       | One-time device authentication |
| **Device JWT**    | 5 minutes | API access                | Network info operations        |

### Security Features

- **bcrypt Password Hashing**: 12 salt rounds
- **JWT Token Expiration**: Configurable token lifetimes
- **Role-Based Access Control**: Super Admin → Admin → Device hierarchy
- **Password Strength Validation**: Complex password requirements
- **Rate Limiting**: Prevent brute force attacks

---

## � **Complete Documentation Links**

### Detailed Guides

- **[📖 Complete API Reference](./docs/API_DOCUMENTATION.md)** - All endpoints with examples, authentication flows, and request/response schemas
- **[👑 Super Admin Management](./docs/SUPER_ADMIN.md)** - Complete super admin setup, management, and security procedures
- **[🗄️ Database Documentation](./docs/DATABASE_DOCUMENTATION.md)** - MongoDB schema, relationships, queries, and maintenance
- **[🧪 Testing Guide](./docs/TESTING_GUIDE.md)** - Unit tests, integration tests, coverage reports, and manual testing
- **[🚀 Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment, Docker, cloud platforms, and CI/CD

### Quick Database Schema Reference

```mermaid
erDiagram
    Admin ||--o{ LibraryToken : creates
    Admin ||--o{ Admin : manages
    LibraryToken ||--o{ AppInfo : authenticates
    AppInfo ||--o{ NetworkInfo : owns
```

**Key Collections:**

- **Admin**: User management with role-based access (admin/superadmin)
- **LibraryToken**: 32-char tokens for device registration (30-day expiry)
- **AppInfo**: Device/application registration and tracking
- **NetworkInfo**: WiFi network configurations per device

> **📝 Note**: See [Database Documentation](./docs/DATABASE_DOCUMENTATION.md) for complete schema details, constraints, and operations.

---

## 🛠️ **Scripts & CLI Tools**

### Available Scripts

| Script                 | Command                     | Purpose                           | Documentation                            |
| ---------------------- | --------------------------- | --------------------------------- | ---------------------------------------- |
| **Create Super Admin** | `npm run create-superadmin` | Initial super admin setup         | Interactive CLI with security validation |
| **Manage Super Admin** | `npm run manage-superadmin` | Complete admin management console | 6-option management interface            |
| **Development Server** | `npm run dev`               | Start with auto-restart           | Nodemon-powered development              |
| **Production Server**  | `npm start`                 | Production server                 | Optimized for production                 |
| **Run Tests**          | `npm test`                  | Execute test suite                | Jest testing framework                   |
| **Lint Code**          | `npm run lint`              | Code quality check                | ESLint validation                        |

### Super Admin Management Console

```bash
npm run manage-superadmin
```

**Available Options:**

1. 👤 View Super Admin Information
2. 🔒 Reset Super Admin Password (with current password verification)
3. 🆘 Emergency Password Reset (when password unknown)
4. 📊 View System Statistics
5. 👥 List All Admin Accounts
6. 🚪 Exit

### Script Security Features

- **Hidden Password Input**: Asterisk masking for security
- **Password Strength Validation**: Complex requirements enforcement
- **Confirmation Prompts**: Multiple confirmations for destructive operations
- **Emergency Recovery**: Direct database access for password recovery
- **Audit Trail**: Operation logging and tracking

---

## 🧪 **Quick Testing Reference**

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Test super admin system
npm run manage-superadmin

# Interactive API testing
# Navigate to: http://localhost:3000/api-docs
```

**Coverage Status**: 91% overall with comprehensive unit and integration tests

> **📋 Details**: See [Testing Guide](./docs/TESTING_GUIDE.md) for complete testing procedures, coverage reports, and CI/CD setup.

---

## 🚀 **Quick Deployment Reference**

```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start

# With Docker
docker-compose up -d

# Health check
curl http://localhost:3000/health
```

**Supported Platforms**: AWS, Google Cloud, Heroku, Docker containers

> **🔧 Details**: See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for production deployment, security, monitoring, and CI/CD pipelines.

---

## 🔧 **Development**

### Project Structure

```
├── src/                    # Source code
│   ├── controllers/        # Request handlers
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   └── config/            # Configuration files
├── scripts/               # CLI management tools
├── tests/                 # Test files
├── docs/                  # Documentation
├── public/                # Static assets
└── logs/                  # Application logs
```

### Development Workflow

1. **Feature Development**

   ```bash
   # Create feature branch
   git checkout -b feature/new-feature

   # Start development server
   npm run dev

   # Run tests during development
   npm run test:watch
   ```

2. **Code Quality**

   ```bash
   # Lint code
   npm run lint

   # Fix linting issues
   npm run lint:fix
   ```

3. **Testing**

   ```bash
   # Run full test suite
   npm test

   # Test specific functionality
   npm run manage-superadmin
   ```

### Contributing Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Use meaningful commit messages
- Test super admin functionality after auth changes

---

## 📖 **Detailed Documentation**

### Complete Guides

- **[Super Admin Management](./docs/SUPER_ADMIN.md)** - Comprehensive super admin guide
- **[API Reference](./docs/API_DOCUMENTATION.md)** - Complete API documentation with examples
- **[Main README](./README.md)** - Project overview and basic setup

### Quick Reference

- **Authentication Flow**: Multi-tier JWT system (Admin → Library → Device)
- **Super Admin**: Single super admin with complete system control
- **Database**: MongoDB with Mongoose ODM and relationship management
- **Security**: bcrypt hashing, JWT tokens, role-based access control
- **API**: RESTful endpoints with Swagger documentation
- **CLI Tools**: Interactive management console with security features

---

## 🆘 **Support & Troubleshooting**

### Common Issues

#### 1. Super Admin Creation Issues

```bash
# Check if super admin already exists
npm run manage-superadmin
# Select option 2 to view existing super admin

# If needed, use emergency password reset
# Select option 3 in management console
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
mongod --version

# Verify connection string in .env
# Test connection: npm run manage-superadmin
```

#### 3. JWT Token Issues

```bash
# Verify JWT_SECRET is set and 32+ characters
# Check token expiration settings in .env
# Test authentication flow via Swagger UI
```

### Getting Help

- **Documentation**: Check this hub and linked documents
- **Interactive Testing**: Use `npm run manage-superadmin`
- **API Testing**: Navigate to http://localhost:3000/api-docs
- **Health Checks**: Visit http://localhost:3000/health

---

## 📝 **License & Credits**

**License**: ISC  
**Author**: Mustofa Mahmud  
**Project**: Express Learning - Enterprise Authentication System

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Node.js**: >=16.0.0  
**Documentation Status**: ✅ Complete
