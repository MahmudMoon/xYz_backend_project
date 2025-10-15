# Express Learning Project

A comprehensive Node.js Express.js application with advanced authentication, MongoDB integration, and device management features. This project demonstrates enterprise-level API development with JWT authentication, library token management, and secure device authentication flows.

> **📚 Complete Documentation**: See [DOCUMENTATION_HUB.md](./DOCUMENTATION_HUB.md) for comprehensive guides covering API documentation, database schema, testing procedures, deployment instructions, and more.

## 🚀 Features

- **MVC Architecture**: Well-organized Model-View-Controller structure with service layers
- **JWT Authentication**: Multi-tier authentication system (Admin + Device tokens)
- **Device Authentication**: Library token-based device authentication with short-lived JWT tokens
- **MongoDB Integration**: Complete database integration with Mongoose ODM
- **Super Admin System**: Hierarchical role-based admin management with CLI tools
- **Admin Management**: Full admin CRUD operations with secure authentication
- **Library Token System**: 32-character hash token generation and management
- **RESTful API**: Complete CRUD operations for network information management
- **Swagger Documentation**: Interactive API documentation with OpenAPI 3.0
- **Error Handling**: Comprehensive error handling with detailed logging
- **Input Validation**: Robust validation using express-validator
- **Security Middleware**: Rate limiting, CORS, Helmet, and authentication guards
- **Testing Ready**: Structured for unit tests with Jest and Supertest

## 📁 Project Structure

```
├── src/
│   ├── controllers/     # Request handlers and business logic
│   │   ├── adminController.js      # Admin authentication & management
│   │   ├── deviceController.js     # Device authentication handlers
│   │   └── networkInfoController.js # Network info CRUD operations
│   ├── routes/         # Route definitions and middleware
│   │   ├── adminRoutes.js          # Admin authentication routes
│   │   ├── deviceRoutes.js         # Device authentication routes
│   │   ├── networkInfoRoutes.js    # Network info API routes
│   │   └── healthRoutes.js         # Health check endpoints
│   ├── services/       # Business logic and data manipulation
│   │   ├── adminService.js         # Admin & library token services
│   │   └── deviceService.js        # Device authentication services
│   ├── middleware/     # Custom middleware functions
│   │   ├── auth.js                 # JWT authentication middleware
│   │   ├── validation.js           # Input validation middleware
│   │   ├── errorHandler.js         # Error handling middleware
│   │   └── logger.js               # Request logging middleware
│   ├── models/         # MongoDB models with Mongoose
│   │   ├── Admin.js               # Admin user model
│   │   ├── LibraryToken.js        # Library token model
│   │   ├── AppInfo.js             # Device app information model
│   │   └── NetworkInfo.js         # Network information model
│   ├── config/         # Configuration files
│   │   ├── database.js            # MongoDB connection config
│   │   ├── swagger.js             # Swagger/OpenAPI configuration
│   │   └── config.js              # Application configuration
│   └── app.js          # Express application setup
├── scripts/            # Super Admin management CLI tools
│   ├── createSuperAdmin.js        # Initial super admin creation & setup
│   └── manageSuperAdmin.js        # Complete management & testing console
├── public/             # Static files (CSS, JS, images)
├── logs/               # Application logs (auto-generated)
├── server.js           # Server entry point with graceful shutdown
└── package.json        # Project dependencies and scripts
```

## 🛠️ Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Configure MongoDB**
   - Install MongoDB locally or set up MongoDB Atlas
   - Update the MongoDB connection string in your `.env` file
   ```env
   MONGODB_URI=mongodb://localhost:27017/express_learning
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   NODE_ENV=development
   PORT=3000
   ```

## 🚦 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Lint Code

```bash
npm run lint
```

## 👑 Super Admin Management

This project includes a comprehensive **Super Admin Management System** with CLI scripts for secure administration:

### 🔐 Super Admin Features

- **🎯 Single Super Admin**: Only one super admin allowed in the system
- **👤 Admin Management**: Create, manage, and revoke admin privileges
- **🔒 Secure Authentication**: Multi-layer password verification system
- **🆘 Emergency Access**: Password recovery for emergency situations
- **📊 System Monitoring**: Complete admin oversight and management
- **🛡️ Role-Based Access**: Hierarchical admin → superadmin privilege system

### 🛠️ Available Scripts

#### 1. Create Super Admin

```bash
npm run create-superadmin
```

**Features:**

- Interactive CLI with hidden password input
- Email validation and duplicate prevention
- Strong password requirements (12+ chars, mixed case, numbers, symbols)
- Single super admin enforcement
- Secure bcrypt hashing (12 salt rounds)

#### 2. Manage Super Admin

```bash
npm run manage-superadmin
```

**Interactive Management Console:**

```
🛠️  Super Admin Management Console
════════════════════════════════════════════════════════════════════════════════
1. 👤 View Super Admin Information
2. 🔒 Reset Super Admin Password (with current password verification)
3. 🆘 Emergency Password Reset (when password unknown)
4. 📊 View System Overview
5. 👥 List All Admin Accounts
6. 🚪 Exit
════════════════════════════════════════════════════════════════════════════════
```

**Capabilities:**

- **Profile Management**: View super admin details and creation info
- **Secure Password Reset**: Verify current password before updating
- **Emergency Recovery**: Reset password when current password is lost
- **System Overview**: View total admins, active accounts, and system health
- **Admin Oversight**: List all admin accounts with status and roles

#### 3. Test Super Admin (Integrated)

```bash
npm run manage-superadmin
# Use the management console for all testing and verification
```

**Note:** All testing functionality is integrated into the management console. The `test-superadmin` command redirects to the main management interface for streamlined operations.

### 🔒 Security Implementation

#### Password Security

- **Bcrypt Hashing**: 12 salt rounds for maximum security
- **Strong Requirements**: Minimum 12 characters with complexity rules
- **Hidden Input**: CLI password masking for secure entry
- **Verification**: Double confirmation for all password operations

#### Access Control

- **Role Hierarchy**: Super Admin → Admin → User privilege levels
- **JWT Authentication**: Secure token-based API access
- **Database Constraints**: Unique super admin enforcement at model level
- **Audit Trail**: Creation tracking and management history

#### Emergency Features

- **Emergency Reset**: Direct database password reset for recovery
- **Confirmation Steps**: Multiple confirmations for destructive operations
- **Visible Emergency Input**: Password visible only during emergency reset
- **Verification Testing**: Immediate password validation after reset

### 📋 Super Admin Workflow

#### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB and JWT settings

# 3. Create super admin
npm run create-superadmin
```

#### Daily Management

```bash
# Interactive management console
npm run manage-superadmin

# Quick testing/verification
npm run test-superadmin
```

#### Emergency Recovery

```bash
# If super admin password is lost
npm run manage-superadmin
# Choose option 3: Emergency Password Reset
```

### 🚨 Important Security Notes

- **Single Super Admin**: Only one super admin can exist - this is enforced at both application and database levels
- **Emergency Use Only**: Emergency password reset should only be used when current password is unknown
- **Production Caution**: Always backup database before running admin management operations
- **Secure Storage**: Super admin credentials should be stored securely and shared minimally
- **Regular Testing**: Use test script to verify super admin functionality periodically

## 📚 API Documentation

This project includes comprehensive **Swagger/OpenAPI 3.0** documentation for all endpoints:

## 📱 Interactive Documentation

- **📖 Complete API Documentation**: [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - Comprehensive API guide with examples
- **🌐 Swagger UI**: Visit `http://localhost:3000/api-docs` for interactive API documentation
- **🔧 Try It Out**: Test all endpoints directly from the browser with authentication
- **📋 Schema Definitions**: Complete request/response schemas with examples and error codes

## 🔐 Authentication System

This project implements a sophisticated **multi-tier authentication system**:

### Authentication Flow

```
1. Admin Login → JWT Token (24h)
2. Generate Library Token → 32-char hash (30 days)
3. Device Auth → Short-lived JWT (5 minutes)
4. Access Protected APIs → Network Info endpoints
```

### 🔑 Authentication Tiers

1. **Admin Authentication**: Long-lived JWT tokens for administrative operations
2. **Library Tokens**: 32-character hash tokens for device registration
3. **Device Authentication**: Short-lived JWT tokens for API access

## 📋 API Endpoints

#### 🏥 Health & System

- `GET /health` - Basic health check with database status
- `GET /health/system` - Detailed system information

#### 👤 Admin Authentication (`/api/admin/*`)

- `POST /api/admin/verify` - **Regular admin** login authentication
- `GET /api/admin/profile` - Get admin profile (requires admin JWT)
- `PUT /api/admin/profile` - Update admin profile (requires admin JWT)
- `DELETE /api/admin/profile` - Delete admin account (requires admin JWT)

#### 👑 Super Admin Management (`/api/superadmin/*`)

- `POST /api/superadmin/verify` - **Super admin** login authentication (no auth required)
- `POST /api/superadmin/admins` - Create new admin account (requires super admin JWT)
- `GET /api/superadmin/admins` - List all admin accounts with details (requires super admin JWT)
- `GET /api/superadmin/admins/:id` - Get specific admin account details (requires super admin JWT)
- `PUT /api/superadmin/admins/:id` - Update admin account information (requires super admin JWT)
- `DELETE /api/superadmin/admins/:id` - Delete admin account (requires super admin JWT)
- `PUT /api/superadmin/admins/:id/toggle-status` - Activate/deactivate admin (requires super admin JWT)
- `PUT /api/superadmin/admins/:id/revoke-privileges` - Revoke admin privileges (requires super admin JWT)

#### 🎫 Library Token Management (`/api/admin/*` - Admin Auth Required)

- `POST /api/admin/library-token` - Generate new library token
- `GET /api/admin/library-tokens` - Get admin's library tokens
- `GET /api/admin/library-tokens/all` - Get all library tokens (admin only)
- `PUT /api/admin/library-token/:id/deactivate` - Deactivate library token

#### 📱 Device Authentication (`/device/*` - No Auth Required)

- `POST /device/auth` - Authenticate device using library token → get device JWT
- `GET /device/validate-token` - Validate device JWT token
- `GET /device/apps` - Get authenticated apps list

- `PUT /device/app/:id/deactivate` - Deactivate app info

#### 🌐 Network Information (`/api/network-info/*` - Device Auth Required)

- `GET /api/network-info` - Get all network information (requires device JWT)
- `GET /api/network-info/:id` - Get network info by ID (requires device JWT)
- `POST /api/network-info` - Create network information (requires device JWT)
- `PUT /api/network-info/:id` - Update network information (requires device JWT)
- `DELETE /api/network-info/:id` - Delete network information (requires device JWT)

### 🚀 Quick Start Authentication Flow

> **⚠️ Note**: Admin accounts must be created by Super Admin. Use `npm run create-superadmin` first, then create admins via Super Admin API.

**1. Login Admin:**

```bash
curl -X POST http://localhost:3000/api/admin/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
# Returns: { "token": "admin-jwt-token", ... }
```

**2. Generate Library Token:**

```bash
curl -X POST http://localhost:3000/api/admin/library-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-jwt-token}" \
  -d '{"description": "Mobile App Library Token"}'
# Returns: { "token": "32-character-hash-token", ... }
```

**3. Device Authentication:**

**3. Device Authentication:**

```bash
curl -X POST http://localhost:3000/device/auth \
  -H "Content-Type: application/json" \
  -d '{
    "token": "32-character-hash-token",
    "appInfo": {
      "appName": "My Mobile App",
      "version": "1.2.3"
    }
  }'
# Returns: { "deviceToken": "device-jwt-token", ... }
```

**4. Access Network APIs:**

**5. Access Protected Network Info API:**

```bash
curl -X GET http://localhost:3000/api/network-info \
  -H "Authorization: Bearer {device-jwt-token}"
```

**6. Create Network Information:**

```bash
curl -X POST http://localhost:3000/api/network-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {device-jwt-token}" \
  -d '{
    "networkOperatorName": "Verizon",
    "signalDbm": -75,
    "networkType": "5G",
    "networkQuality": "Good",
    "countryIso": "US"
  }'
```

## 🧪 Testing

The project includes comprehensive tests for all endpoints:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

- **Logs**: Application logs are stored in the `logs/` directory
- **Health Check**: Visit `http://localhost:3000/health` for server status
- **Web Interface**: Visit `http://localhost:3000` for a web-based API tester

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/express_learning

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_chars
JWT_EXPIRES_IN=24h

# Admin Configuration
ADMIN_JWT_EXPIRES_IN=24h
DEVICE_JWT_EXPIRES_IN=5m

# Rate Limiting
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=info
```

### 🛡️ Security Best Practices

1. **JWT Secret**: Use a strong, randomly generated JWT secret (minimum 32 characters)
2. **Environment Variables**: Never commit `.env` files - use `.env.example` for templates
3. **Rate Limiting**: Authentication endpoints are rate-limited (5 attempts per 15 minutes)
4. **Token Expiry**: Device tokens expire in 5 minutes for enhanced security
5. **Password Requirements**: Admin passwords require minimum 6 characters
6. **Database Security**: Use MongoDB authentication in production environments

## 📚 Learning Objectives

This project demonstrates advanced Node.js/Express.js concepts:

### 🏗️ Architecture & Design Patterns

1. **MVC Pattern**: Separation of concerns with controllers, services, and models
2. **Service Layer**: Business logic separation from HTTP handlers
3. **Repository Pattern**: Database abstraction through Mongoose models
4. **Middleware Pattern**: Reusable authentication and validation logic

### 🔐 Authentication & Security

5. **Multi-tier JWT Authentication**: Admin and device authentication flows
6. **Token Management**: Library tokens, refresh tokens, and short-lived JWTs
7. **Security Middleware**: Rate limiting, input validation, and error handling
8. **Password Security**: Bcrypt hashing and secure password policies

### 🗄️ Database Integration

9. **MongoDB with Mongoose**: Schema design, relationships, and queries
10. **Data Modeling**: Complex relationships between admins, tokens, and devices
11. **Database Indexing**: Performance optimization with proper indexes
12. **Connection Management**: Graceful database connections and error handling

### 🛠️ Modern Development Practices

13. **RESTful API Design**: Resource-based URLs and proper HTTP methods
14. **API Documentation**: Interactive Swagger/OpenAPI documentation
15. **Error Handling**: Comprehensive error responses and logging
16. **Input Validation**: Schema validation with express-validator
17. **Testing Strategy**: Unit testing setup with Jest and Supertest
18. **Environment Configuration**: Secure configuration management

### 🚀 Production Readiness

19. **Graceful Shutdown**: Proper server lifecycle management
20. **Logging Strategy**: Structured logging with rotation and levels
21. **Security Headers**: CORS, Helmet, and security best practices
22. **Performance**: Efficient database queries and response optimization

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run tests to ensure everything works
6. Submit a pull request

## � Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger UI, OpenAPI 3.0
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest, Supertest (configured)
- **Logging**: Custom middleware with file rotation
- **Development**: Nodemon, ESLint

## 🏃‍♂️ Quick Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd express-learning-project
npm install

# Start MongoDB (if running locally)
mongod

# Start development server
npm run dev

# Visit the application
open http://localhost:3000
open http://localhost:3000/api-docs  # Interactive Swagger Documentation
open ./docs/API_DOCUMENTATION.md    # Complete API Documentation
```

## 🎯 Project Highlights

### ✨ Advanced Features Implemented

- **🔐 Multi-tier Authentication**: Admin → Library Token → Device JWT flow
- **⚡ Short-lived Tokens**: 5-minute device JWTs for enhanced security
- **📊 Usage Tracking**: Monitor token usage and app authentication activity
- **🛡️ Rate Limiting**: Prevent brute force attacks on authentication endpoints
- **📖 Interactive Docs**: Complete Swagger UI with try-it-out functionality
- **🗄️ Database Relations**: Complex MongoDB relationships with proper indexing
- **🔄 Graceful Shutdown**: Production-ready server lifecycle management
- **📝 Comprehensive Logging**: Request logging with automatic file rotation

## �📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

If you have any questions or need help with this project, please open an issue or contact the author.

---

**Happy Learning! 🎉**

_This project demonstrates enterprise-level Node.js development practices with advanced authentication, database integration, and API security._
