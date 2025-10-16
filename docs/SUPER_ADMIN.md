# Super Admin Management System

This document describes the super admin functionality implemented in the Express.js application, including setup, usage, and API endpoints.

## 📋 Overview

The super admin system provides hierarchical admin management with the following key features:

- **Single Super Admin**: Only one super admin can exist in the system
- **Admin Management**: Create, manage, revoke, restore, and delete regular admin accounts
- **Separate Authentication**: Dedicated super admin login endpoint for enhanced security
- **Role-based Access Control**: Separate permissions for super admin and regular admin operations
- **Comprehensive Monitoring**: Detailed system usage and admin oversight
- **Secure CLI Setup**: Command-line tool for initial super admin creation
- **Security Hardened**: Removed insecure endpoints, enhanced authentication validation

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Super Admin

Use the secure CLI script to create the initial super admin:

```bash
npm run create-superadmin
```

Or run directly:

```bash
node scripts/createSuperAdmin.js
```

**Security Features:**

- Password strength validation (8+ chars, uppercase, lowercase, numbers, special chars)
- Hidden password input with asterisks
- Email validation
- Confirmation prompts
- Prevents duplicate super admin creation

### 3. Start the Application

```bash
npm start
# or for development
npm run dev
```

## 🛠️ Super Admin Management Scripts

### Available Scripts

```bash
# Create initial super admin account
npm run create-superadmin

# Delete super admin account (with security checks)
npm run delete-superadmin

# Manage super admin (view info, reset password, system overview)
npm run manage-superadmin

# Test all super admin functionality
npm run test-superadmin
```

### Script Details

#### Create Super Admin (`npm run create-superadmin`)

- **Purpose**: Create the initial super admin account
- **Features**:
  - Password strength validation
  - Email validation
  - Prevents duplicate super admin creation
  - Secure password input (hidden with asterisks)
- **Usage**: Run once during initial setup

#### Delete Super Admin (`npm run delete-superadmin`)

- **Purpose**: Permanently delete the super admin account
- **Security Features**:
  - Multiple confirmation prompts
  - Email and password verification
  - Typed confirmation phrase required: "DELETE SUPER ADMIN"
  - 5-second countdown before deletion
  - Audit logging
- **Use Cases**:
  - System reset/maintenance
  - Development/testing cleanup
  - Credential reset (delete + recreate)
- **⚠️ WARNING**: This action cannot be undone!

#### Manage Super Admin (`npm run manage-superadmin`)

- **Purpose**: Interactive management console
- **Features**:
  - View super admin information
  - Reset super admin password securely
  - View system overview (admin counts, recent activity)
  - List all admin accounts
  - Non-destructive operations only
- **Usage**: Regular maintenance and monitoring

#### Test Super Admin (`npm run test-superadmin`)

- **Purpose**: Automated testing of super admin functionality
- **Features**:
  - Complete API endpoint testing
  - Authentication and authorization testing
  - Error handling validation
  - Comprehensive test reporting with colored output
- **Usage**: Verify system functionality after changes

## 🔐 Authentication

### Super Admin Login

**🚨 SECURITY UPDATE**: Super admin now uses a **dedicated authentication endpoint** separate from regular admins:

```bash
POST /api/superadmin/verify
Content-Type: application/json

{
  "email": "superadmin@example.com",
  "password": "your-secure-password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Super admin verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "superadmin@example.com",
    "role": "superadmin",
    "isActive": true
  },
  "expiresIn": "24h"
}
```

### Authentication Security Enhancement

- **Separate Endpoints**: Super admin and regular admin use different login routes
- **Role Validation**: Each endpoint validates the correct role during authentication
- **Enhanced Security**: Prevents role confusion and unauthorized access attempts

**Important:** Include the JWT token in the `Authorization` header for all super admin endpoints:

```
Authorization: Bearer your-jwt-token-here
```

## � Security Improvements

### Recent Security Enhancements

- **🚨 Removed Insecure Endpoint**: The old `/api/admin/create` endpoint has been permanently removed for security reasons
- **🎯 Dedicated Authentication**: Super admin uses separate login endpoint `/api/superadmin/verify`
- **🛡️ Role Validation**: Enhanced role checking prevents unauthorized access attempts
- **⚡ Secure Admin Creation**: All admin accounts must be created through super admin with proper authentication

### Admin Creation Process

**✅ Secure Method (Required):**

- Super admin logs in via `/api/superadmin/verify`
- Creates admins via `/api/superadmin/admins` with JWT authentication

**❌ Insecure Method (Removed):**

- Direct admin creation without authentication - **NO LONGER AVAILABLE**

## �📚 API Endpoints

### Base URL: `/api/superadmin`

All endpoints require super admin authentication via JWT token.

### 1. Get All Regular Admins

```bash
GET /api/superadmin/admins
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `isActive` (optional): Filter by status (true/false)
- `search` (optional): Search by email

**Example:**

```bash
curl -X GET "http://localhost:3000/api/superadmin/admins?page=1&limit=5&isActive=true" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**

```json
{
  "success": true,
  "message": "Regular admins retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin1@example.com",
      "role": "admin",
      "isActive": true,
      "createdBy": {
        "email": "superadmin@example.com",
        "role": "superadmin"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "pages": 3
  }
}
```

### 2. Create New Regular Admin

```bash
POST /api/superadmin/admins
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newadmin@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Example:**

```bash
curl -X POST "http://localhost:3000/api/superadmin/admins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'
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
    "createdBy": {
      "email": "superadmin@example.com",
      "role": "superadmin"
    }
  }
}
```

### 3. Revoke Admin Privileges

```bash
PUT /api/superadmin/admins/{adminId}/revoke
```

**Example:**

```bash
curl -X PUT "http://localhost:3000/api/superadmin/admins/507f1f77bcf86cd799439012/revoke" \
  -H "Authorization: Bearer your-jwt-token"
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
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Restore Admin Privileges

```bash
PUT /api/superadmin/admins/{adminId}/restore
```

**Example:**

```bash
curl -X PUT "http://localhost:3000/api/superadmin/admins/507f1f77bcf86cd799439012/restore" \
  -H "Authorization: Bearer your-jwt-token"
```

### 5. Delete Admin Permanently

```bash
DELETE /api/superadmin/admins/{adminId}
```

**Example:**

```bash
curl -X DELETE "http://localhost:3000/api/superadmin/admins/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**

```json
{
  "success": true,
  "message": "Admin deleted successfully",
  "deletedAdmin": {
    "id": "507f1f77bcf86cd799439012",
    "email": "admin@example.com"
  },
  "deletedAt": "2024-01-01T12:00:00.000Z"
}
```

## 🛡️ Security Features

### Role-based Access Control

- **Super Admin**: Full system access, can manage all regular admins
- **Regular Admin**: Limited to their own operations, cannot manage other admins

### Middleware Protection

- `authenticateSuperAdmin`: Validates JWT token and ensures super admin role
- `canManageAdmins`: Additional layer ensuring admin management permissions

### Input Validation

- Email format validation using `express-validator`
- Password strength requirements (CLI script)
- MongoDB ObjectId validation for admin IDs
- Request body sanitization

### Database Constraints

- Single super admin constraint (enforced in model pre-save middleware)
- Email uniqueness across all admin accounts
- Role enum validation (admin/superadmin)

## 📊 Database Schema

### Admin Model Extensions

```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: function() {
      return this.role === 'admin';
    }
  }
}
```

## 🚫 Error Handling

### Common Error Responses

**401 Unauthorized:**

```json
{
  "success": false,
  "error": "Access denied. No token provided.",
  "code": "NO_TOKEN"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": "Access denied. Super admin privileges required.",
  "code": "SUPER_ADMIN_REQUIRED"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "Admin not found",
  "code": "ADMIN_NOT_FOUND"
}
```

**409 Conflict:**

```json
{
  "success": false,
  "error": "Admin with this email already exists",
  "code": "ADMIN_EXISTS"
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## 📖 API Documentation

Full API documentation is available via Swagger UI when the application is running:

```
http://localhost:3000/api-docs
```

The documentation includes:

- Interactive endpoint testing
- Request/response schemas
- Authentication requirements
- Error code references

## 🔧 Development & Testing

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Testing Super Admin Functionality

1. **Create Super Admin:**

   ```bash
   npm run create-superadmin
   ```

2. **Login as Super Admin:**

   ```bash
   curl -X POST "http://localhost:3000/api/admin/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"superadmin@example.com","password":"your-password"}'
   ```

3. **Test Admin Creation:**
   ```bash
   curl -X POST "http://localhost:3000/api/superadmin/admins" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"email":"test@example.com","password":"TestPass123","confirmPassword":"TestPass123"}'
   ```

### Environment Variables

Ensure your `.env` file includes:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

## 🔄 Migration from Regular Admin System

If you have existing regular admins and want to add super admin functionality:

1. **Backup your database** before running migrations
2. **Create super admin** using the CLI script
3. **Update existing admin records** to have the new role field (defaults to 'admin')
4. **Test the system** with both super admin and regular admin accounts

The system is designed to be backward-compatible with existing admin functionality.

## 🚨 Important Security Notes

1. **Single Super Admin**: The system enforces only one super admin can exist
2. **Strong Passwords**: Use the CLI script which enforces password strength
3. **JWT Security**: Keep JWT secrets secure and rotate them regularly
4. **Database Access**: Limit database access to authorized personnel only
5. **HTTPS**: Always use HTTPS in production for API endpoints
6. **Rate Limiting**: Consider implementing rate limiting for admin endpoints
7. **Audit Logging**: Consider adding audit logs for admin management actions

## 📞 Support & Troubleshooting

### Common Issues

1. **"Super admin already exists" error:**

   - Only one super admin is allowed
   - Delete existing super admin or use different approach

2. **Authentication failures:**

   - Check JWT token validity
   - Ensure correct Authorization header format
   - Verify super admin role in token

3. **Database connection issues:**
   - Check MongoDB connection string
   - Ensure database is running
   - Verify network connectivity

### Logs and Debugging

Enable detailed logging by setting:

```env
NODE_ENV=development
DEBUG=app:*
```

This will provide detailed information about authentication, database operations, and error handling.

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Author:** Express Learning Project Team
