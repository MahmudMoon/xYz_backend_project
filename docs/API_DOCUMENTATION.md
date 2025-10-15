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

This API implements a sophisticated **3-tier authentication system**:

1. **Admin Authentication** → Long-lived JWT (24 hours)
2. **Library Token Generation** → 32-character hash tokens (30 days)
3. **Device Authentication** → Short-lived JWT (5 minutes)

### Authentication Flow Diagram

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

### 👤 Admin Management

| Method   | Endpoint             | Description                | Authentication |
| -------- | -------------------- | -------------------------- | -------------- |
| `POST`   | `/api/admin/create`  | Create new admin account   | None           |
| `POST`   | `/api/admin/verify`  | Admin login authentication | None           |
| `GET`    | `/api/admin/profile` | Get admin profile          | Admin JWT      |
| `PUT`    | `/api/admin/profile` | Update admin profile       | Admin JWT      |
| `DELETE` | `/api/admin/profile` | Delete admin account       | Admin JWT      |

#### Create Admin

```bash
POST /api/admin/create
Content-Type: application/json

{
  "email": "admin@example.com",
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
    "email": "admin@example.com",
    "isActive": true,
    "createdAt": "2025-10-15T10:30:00.000Z",
    "id": "507f1f77bcf86cd799439011"
  }
}
```

#### Admin Login

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

| Method | Endpoint                 | Description                             | Authentication |
| ------ | ------------------------ | --------------------------------------- | -------------- |
| `POST` | `/device/auth`           | Authenticate device using library token | None           |
| `GET`  | `/device/validate-token` | Validate device JWT token               | None           |
| `GET`  | `/device/apps`           | Get authenticated apps list             | None           |

| `PUT` | `/device/app/:id/deactivate` | Deactivate app info | None |

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

**Response:**

```json
{
  "success": true,
  "message": "Device authenticated successfully",
  "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
- **Helmet**: Security headers for production deployment
- **Input Validation**: Comprehensive validation using express-validator

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
# 1. Create Admin
curl -X POST http://localhost:3000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!", "confirmPassword": "TestPass123!"}'

# 2. Admin Login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!"}' | jq -r '.token')

# 3. Generate Library Token
LIBRARY_TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/library-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"description": "Test Token"}' | jq -r '.token.token')

# 4. Device Authentication
DEVICE_TOKEN=$(curl -s -X POST http://localhost:3000/device/auth \
  -H "Content-Type: application/json" \
  -d '{"token": "'$LIBRARY_TOKEN'", "appInfo": {"appName": "Test App", "version": "1.0.0"}}' | jq -r '.deviceToken')

# 5. Access Network Info API
curl -X GET http://localhost:3000/api/network-info \
  -H "Authorization: Bearer $DEVICE_TOKEN"
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
- ✅ JWT secrets are strong and secure
- ✅ Database connection encrypted
- ✅ CORS configured for production domains
- ✅ Security headers enabled

### Scaling Considerations

- **Horizontal scaling**: Stateless JWT tokens enable easy horizontal scaling
- **Database optimization**: Proper indexing for high-performance queries
- **Caching**: Redis integration recommended for high-traffic scenarios
- **Load balancing**: Compatible with standard load balancers
- **Monitoring**: Comprehensive logging for application monitoring

---

_This documentation is automatically updated with the latest API changes. For the most current interactive documentation, visit the Swagger UI at http://localhost:3000/api-docs when the server is running._
