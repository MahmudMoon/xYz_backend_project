# API Documentation

## Express Learning API v1.0.0

A comprehensive Express.js API with multi-tier JWT authentication, MongoDB integration, and secure device management system.

---

## 🔗 Interactive Documentation

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The complete interactive API documentation is available through Swagger UI when the server is running. This provides:

- **Try It Out** functionality for all endpoints
- **Schema definitions** for all request/response models
- **Authentication flow** with JWT token management
- **Real-time testing** with live server responses

---

## 🔐 Authentication System

### Overview

This API implements a sophisticated **4-tier authentication system** with refresh token support:

1. **Admin/Super Admin Authentication** → Long-lived JWT (24 hours) with separate endpoints
2. **Library Token Generation** → 32-character hash tokens (30 days)
3. **Device Authentication** → Short-lived JWT (5 minutes) + Refresh Token (7 days)
4. **Token Refresh** → Seamless token renewal without re-authentication

### Authentication Flow Diagram

```
┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Admin/SuperAdmin │───▶│ Library Token   │───▶│ Device Auth     │───▶│ API Access      │
│ Login            │    │ Generation      │    │                 │    │                 │
│                  │    │                 │    │ POST /device    │    │ /api/network-   │
│ POST /api/admin/ │    │ POST /api/admin │    │ /auth           │    │ info/*          │
│ verify           │    │ /library-token  │    │                 │    │                 │
│ POST /api/       │    │                 │    │ Returns:        │    │ Requires:       │
│ superadmin/verify│    │ Returns: 32-char│    │ • Access Token  │    │ • Device JWT    │
│                  │    │ Hash Token      │    │   (5min)        │    │   Token         │
│ Returns: Admin/  │    │                 │    │ • Refresh Token │    │ • Auto-refresh  │
│ SuperAdmin JWT   │    │                 │    │   (7 days)      │    │   via refresh   │
│ (24h)            │    │                 │    │                 │    │   endpoint      │
└──────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ Token Refresh   │
                                               │                 │
                                               │ POST /device/   │
                                               │ refresh-token   │
                                               │                 │
                                               │ Returns: New    │
                                               │ Access Token    │
                                               │ (5min)          │
                                               └─────────────────┘
```

---

## 📚 API Endpoints

### 🏥 Health & System

| Method | Endpoint  | Description                             | Authentication |
| ------ | --------- | --------------------------------------- | -------------- |
| `GET`  | `/health` | Basic health check with database status | None           |

**Example Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-10-15T10:30:00.000Z",
  "uptime": 3600.123,
  "memory": {
    "rss": 35192832,
    "heapTotal": 32325632,
    "heapUsed": 28803664
  },
  "environment": "development",
  "database": {
    "connected": true,
    "status": "connected"
  }
}
```

### 👤 Admin Authentication

| Method   | Endpoint                 | Description             | Authentication |
| -------- | ------------------------ | ----------------------- | -------------- |
| `POST`   | `/api/admin/verify`      | **Regular admin** login | None           |
| `POST`   | `/api/superadmin/verify` | **Super admin** login   | None           |
| `GET`    | `/api/admin/profile`     | Get admin profile       | Admin JWT      |
| `PUT`    | `/api/admin/profile`     | Update admin profile    | Admin JWT      |
| `DELETE` | `/api/admin/profile`     | Delete admin account    | Admin JWT      |

> **⚠️ Admin Creation**: Admin accounts can only be created by Super Admin via `POST /api/superadmin/admins`. See [Super Admin Management](#-super-admin-management) section.

#### Regular Admin Login

```bash
POST /api/admin/verify
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "admin@example.com",
    "id": "507f1f77bcf86cd799439011"
  },
  "expiresIn": "24h"
}
```

#### Super Admin Login

```bash
POST /api/superadmin/verify
Content-Type: application/json

{
  "email": "superadmin@example.com",
  "password": "SuperSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Super admin verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "superadmin@example.com",
    "role": "superadmin",
    "id": "507f1f77bcf86cd799439011"
  },
  "expiresIn": "24h"
}
```

## 🚨 **Important Authentication Changes**

### **Separate Login Endpoints**

- **Regular Admins**: Use `POST /api/admin/verify`
- **Super Admins**: Use `POST /api/superadmin/verify`

### **Why Separate Routes?**

1. **Role-Based Validation**: Each endpoint validates the correct role during login
2. **Enhanced Security**: Prevents role confusion and unauthorized access attempts
3. **Clear API Structure**: Distinct endpoints for different user types
4. **Better Error Messages**: Specific feedback for each authentication type

### **Error Scenarios**

- **Super Admin using regular endpoint**: "Invalid credentials. Use super admin login for super admin accounts."
- **Regular Admin using super endpoint**: "Invalid credentials. Use regular admin login for admin accounts."

### 👑 Super Admin Management

| Method   | Endpoint                                       | Description                | Authentication  |
| -------- | ---------------------------------------------- | -------------------------- | --------------- |
| `POST`   | `/api/superadmin/create-admin`                 | Create new admin account   | Super Admin JWT |
| `GET`    | `/api/superadmin/admins`                       | List all admin accounts    | Super Admin JWT |
| `GET`    | `/api/superadmin/admins/:id`                   | Get specific admin details | Super Admin JWT |
| `PUT`    | `/api/superadmin/admins/:id`                   | Update admin information   | Super Admin JWT |
| `DELETE` | `/api/superadmin/admins/:id`                   | Delete admin account       | Super Admin JWT |
| `PUT`    | `/api/superadmin/admins/:id/toggle-status`     | Activate/deactivate admin  | Super Admin JWT |
| `PUT`    | `/api/superadmin/admins/:id/revoke-privileges` | Revoke admin privileges    | Super Admin JWT |

#### Create Admin by Super Admin

```bash
POST /api/superadmin/create-admin
Authorization: Bearer <super_admin_jwt_token>
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "email": "newadmin@example.com",
    "role": "admin",
    "isActive": true,
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2025-10-15T10:30:00.000Z"
  }
}
```

#### List All Admins

```bash
GET /api/superadmin/admins?page=1&limit=10&status=active
Authorization: Bearer <super_admin_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "admins": [
    {
      "id": "507f1f77bcf86cd799439012",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2025-10-15T10:30:00.000Z",
      "lastLoginAt": "2025-10-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalAdmins": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### Revoke Admin Privileges

```bash
PUT /api/superadmin/admins/507f1f77bcf86cd799439012/revoke-privileges
Authorization: Bearer <super_admin_jwt_token>
Content-Type: application/json

{
  "reason": "Security policy violation"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin privileges revoked successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@example.com",
    "isActive": false,
    "revokedAt": "2025-10-15T12:00:00.000Z",
    "revokedBy": "507f1f77bcf86cd799439011"
  }
}
```

### 🎫 Library Token Management

| Method | Endpoint                                  | Description                | Authentication |
| ------ | ----------------------------------------- | -------------------------- | -------------- |
| `POST` | `/api/admin/library-token`                | Generate new library token | Admin JWT      |
| `GET`  | `/api/admin/library-tokens`               | Get admin's library tokens | Admin JWT      |
| `GET`  | `/api/admin/library-tokens/all`           | Get all library tokens     | Admin JWT      |
| `PUT`  | `/api/admin/library-token/:id/deactivate` | Deactivate library token   | Admin JWT      |

#### Generate Library Token

```bash
POST /api/admin/library-token
Authorization: Bearer {admin-jwt-token}
Content-Type: application/json

{
  "description": "Mobile App Library Token",
  "validity": "2025-12-31T23:59:59.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Library token generated successfully",
  "token": {
    "token": "a1b2c3d4e5f6789012345678901234567890abcd",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com"
    },
    "validity": "2025-12-31T23:59:59.000Z",
    "isActive": true,
    "description": "Mobile App Library Token",
    "usageCount": 0,
    "id": "507f1f77bcf86cd799439012"
  }
}
```

### 📱 Device Authentication

| Method | Endpoint                     | Description                             | Authentication |
| ------ | ---------------------------- | --------------------------------------- | -------------- |
| `POST` | `/device/auth`               | Authenticate device using library token | None           |
| `POST` | `/device/refresh-token`      | Refresh device JWT token (NEW)          | None           |
| `GET`  | `/device/validate-token`     | Validate device JWT token               | None           |
| `GET`  | `/device/apps`               | Get authenticated apps list             | None           |
| `PUT`  | `/device/app/:id/deactivate` | Deactivate app info                     | None           |

#### Device Authentication

```bash
POST /device/auth
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6789012345678901234567890abcd",
  "appInfo": {
    "appName": "My Mobile App",
    "version": "1.2.3"
  }
}
```

**Response (Updated with Refresh Token):**

```json
{
  "success": true,
  "message": "Device authenticated successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "5m",
  "appInfo": {
    "appName": "My Mobile App",
    "version": "1.2.3",
    "libraryToken": "a1b2c3d4e5f6789012345678901234567890abcd",
    "authCount": 1,
    "isActive": true,
    "id": "507f1f77bcf86cd799439013"
  },
  "tokenInfo": {
    "createdBy": "admin@example.com",
    "validity": "2025-12-31T23:59:59.000Z",
    "usageCount": 1
  }
}
```

#### Token Refresh (NEW)

When the 5-minute access token expires, use the refresh token to get a new access token without re-authenticating:

```bash
POST /device/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "New access token generated successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "5m"
}
```

### 🌐 Network Information (Protected by Device JWT)

| Method   | Endpoint                             | Description                 | Authentication |
| -------- | ------------------------------------ | --------------------------- | -------------- |
| `GET`    | `/api/network-info`                  | Get all network information | Device JWT     |
| `GET`    | `/api/network-info/:id`              | Get network info by ID      | Device JWT     |
| `POST`   | `/api/network-info`                  | Create network information  | Device JWT     |
| `PUT`    | `/api/network-info/:id`              | Update network information  | Device JWT     |
| `DELETE` | `/api/network-info/:id`              | Delete network information  | Device JWT     |
| `GET`    | `/api/network-info/device/:deviceId` | Get network info by device  | Device JWT     |

| `POST` | `/api/network-info/bulk` | Bulk create network info | Device JWT |

#### Create Network Information

```bash
POST /api/network-info
Authorization: Bearer {device-jwt-token}
Content-Type: application/json

{
  "networkOperatorName": "Verizon Wireless",
  "signalDbm": -75,
  "subscriptionID": "sub_12345",
  "networkType": "5G",
  "networkQuality": "Good",
  "countryIso": "US",
  "isAirplaneModeOn": false,
  "isCellRegistered": true,
  "signalLevel": 4,
  "voiceCallSupport": "Support (VoLTE)",
  "callState": "Idle",
  "networkMNC": "001",
  "isConnected": true,
  "isRoaming": false,
  "networkMCC": "310",
  "connectionType": "Mobile",
  "deviceInfo": {
    "deviceId": "device_001",
    "userId": "user_123",
    "platform": "Android"
  },
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Network information created successfully",
  "data": {
    "networkOperatorName": "Verizon Wireless",
    "signalDbm": -75,
    "subscriptionID": "sub_12345",
    "networkType": "5G",
    "networkQuality": "Good",
    "countryIso": "US",
    "isAirplaneModeOn": false,
    "isCellRegistered": true,
    "signalLevel": 4,
    "voiceCallSupport": "Support (VoLTE)",
    "callState": "Idle",
    "createdAt": "2025-10-15T10:30:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z",
    "id": "507f1f77bcf86cd799439014"
  }
}
```

---

## 🔒 Security Features

### JWT Token Types

| Token Type     | Endpoint            | Validity  | Purpose                                    |
| -------------- | ------------------- | --------- | ------------------------------------------ |
| **Admin JWT**  | `/api/admin/verify` | 24 hours  | Admin operations, library token management |
| **Device JWT** | `/device/auth`      | 5 minutes | Network info API access                    |

### Rate Limiting

- **Authentication endpoints**: 5 attempts per 15 minutes per IP
- **Admin login**: Enhanced rate limiting with lockout mechanism
- **Device authentication**: Basic rate limiting for DDoS protection

### Security Headers

- **CORS**: Configured for development/production environments
- **Helmet**: Enhanced security headers with Content Security Policy (CSP)
- **Input Validation**: Comprehensive validation using express-validator

#### Helmet Security Configuration

The API now includes **Helmet.js** middleware for enhanced security:

```javascript
// Security headers automatically applied to all responses
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
});
```

**Security Headers Added:**

- `Content-Security-Policy`: Prevents XSS attacks
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Enables XSS filtering
- `Strict-Transport-Security`: Enforces HTTPS (production)
- `Referrer-Policy`: Controls referrer information

---

## 📊 Data Models

### NetworkInfo Schema

```javascript
{
  networkOperatorName: String,
  signalDbm: Number,
  subscriptionID: String,
  networkType: String, // 2G, 3G, 4G, 5G, LTE, etc.
  networkQuality: String, // Poor, Fair, Good, Excellent
  countryIso: String,
  isAirplaneModeOn: Boolean,
  isCellRegistered: Boolean,
  signalLevel: Number,
  voiceCallSupport: String,
  callState: String,
  networkMNC: String,
  isConnected: Boolean,
  isRoaming: Boolean,
  networkMCC: String,
  connectionType: String,
  signalAsu: Number,
  signalRssi: Number,
  networkOperatorCode: String,
  deviceInfo: {
    deviceId: String,
    userId: String,
    platform: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Schema

```javascript
{
  email: String, // Unique, validated
  password: String, // Bcrypt hashed
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### LibraryToken Schema

```javascript
{
  token: String, // 32-character unique hash
  createdBy: ObjectId, // Reference to Admin
  validity: Date,
  isActive: Boolean,
  description: String,
  usageCount: Number,
  lastUsed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AppInfo Schema

```javascript
{
  appName: String,
  version: String, // Semantic versioning
  libraryToken: String,
  deviceFingerprint: String,
  authCount: Number,
  isActive: Boolean,
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  lastAuthAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [], // Additional validation errors if applicable
  "timestamp": "2025-10-15T10:30:00.000Z"
}
```

### Common Error Codes

| Code                   | Description                                 | HTTP Status |
| ---------------------- | ------------------------------------------- | ----------- |
| `NO_TOKEN`             | No authentication token provided            | 401         |
| `NO_DEVICE_TOKEN`      | No device token provided                    | 401         |
| `INVALID_TOKEN`        | Invalid JWT token                           | 401         |
| `DEVICE_TOKEN_EXPIRED` | Device token has expired (5min)             | 401         |
| `ADMIN_NOT_FOUND`      | Admin account not found                     | 401         |
| `ADMIN_DEACTIVATED`    | Admin account is deactivated                | 401         |
| `ADMIN_LOCKED`         | Admin account locked due to failed attempts | 423         |
| `VALIDATION_ERROR`     | Input validation failed                     | 400         |
| `RATE_LIMITED`         | Too many requests                           | 429         |
| `APP_DEACTIVATED`      | App has been deactivated                    | 401         |

---

## 🧪 Testing Examples

### Complete Authentication Flow

```bash
# Note: Admin creation is done by Super Admin via /api/superadmin/admins
# This example assumes an admin account already exists

# 1. Admin Login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!"}' | jq -r '.token')

# 2. Generate Library Token
LIBRARY_TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/library-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"description": "Test Token"}' | jq -r '.token.token')

# 3. Device Authentication (with Refresh Token)
DEVICE_AUTH=$(curl -s -X POST http://localhost:3000/device/auth \
  -H "Content-Type: application/json" \
  -d '{"token": "'$LIBRARY_TOKEN'", "appInfo": {"appName": "Test App", "version": "1.0.0"}}')

ACCESS_TOKEN=$(echo $DEVICE_AUTH | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $DEVICE_AUTH | jq -r '.refreshToken')

# 4. Access Network Info API
curl -X GET http://localhost:3000/api/network-info \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Refresh Token when Access Token expires (5min)
NEW_ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/device/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}' | jq -r '.accessToken')

# 6. Continue API access with new token
curl -X GET http://localhost:3000/api/network-info \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN"
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/express_learning

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h
DEVICE_JWT_EXPIRES_IN=5m

# Refresh Token Configuration (NEW)
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret_different_from_jwt_secret
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=info
```

---

## 📈 Performance & Monitoring

### Database Indexes

The API includes optimized database indexes for:

- **Admin email** (unique index)
- **Library token** (compound index: token + isActive)
- **App info** (compound index: appName + version + libraryToken)
- **Network info** (indexes on deviceId, createdAt, networkType)

### Logging

- **Request logging**: All HTTP requests logged with timestamp, IP, and User-Agent
- **Error logging**: Detailed error logs with stack traces for debugging
- **Authentication events**: Login attempts, token generation, and usage tracking

---

## 🚀 Production Deployment

### Security Checklist

- ✅ Environment variables properly configured
- ✅ MongoDB authentication enabled
- ✅ HTTPS/TLS encryption
- ✅ Rate limiting configured
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose sensitive information
- ✅ JWT secrets are strong and secure (separate for access & refresh tokens)
- ✅ Database connection encrypted
- ✅ CORS configured for production domains
- ✅ **Helmet security headers enabled** (Content Security Policy, XSS Protection)
- ✅ **Separate authentication endpoints** for admin roles
- ✅ **Refresh token implementation** for seamless token renewal
- ✅ **Role-based access control** with proper validation

### Scaling Considerations

- **Horizontal scaling**: Stateless JWT tokens enable easy horizontal scaling
- **Database optimization**: Proper indexing for high-performance queries
- **Caching**: Redis integration recommended for high-traffic scenarios
- **Load balancing**: Compatible with standard load balancers
- **Monitoring**: Comprehensive logging for application monitoring

---

_This documentation is automatically updated with the latest API changes. For the most current interactive documentation, visit the Swagger UI at http://localhost:3000/api-docs when the server is running._
