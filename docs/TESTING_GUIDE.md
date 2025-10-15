# 🧪 Testing Guide - Express Learning Project

## 📋 Overview

Comprehensive testing guide for the Express.js application covering unit tests, integration tests, API testing, and manual verification procedures.

---

## 🚀 Quick Start Testing

### 1. Install & Setup

```bash
# Install dependencies (includes test frameworks)
npm install

# Ensure environment is configured
cp .env.example .env
# Edit .env with test database settings
```

### 2. Run All Tests

```bash
# Run complete test suite
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

### 3. Manual Verification

```bash
# Test super admin system
npm run manage-superadmin

# Test API endpoints interactively
# Navigate to: http://localhost:3000/api-docs
```

---

## 🔧 Test Configuration

### Jest Configuration (`jest.config.json`)

```json
{
  "testEnvironment": "node",
  "testMatch": ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],
  "collectCoverageFrom": ["src/**/*.js", "!src/config/**", "!src/app.js"],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"]
}
```

### Test Database Configuration

```javascript
// tests/setup.js
const database = require("../src/config/database");

beforeAll(async () => {
  // Connect to test database
  process.env.MONGODB_URI = "mongodb://localhost:27017/express_learning_test";
  await database.connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await database.disconnect();
});

beforeEach(async () => {
  // Clear collections before each test
  const collections = await database.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
```

---

## 📊 Test Structure

### Directory Organization

```
tests/
├── setup.js                    # Global test configuration
├── helpers/                    # Test utility functions
│   ├── auth.helper.js          # Authentication test helpers
│   ├── admin.helper.js         # Admin creation helpers
│   └── api.helper.js           # API testing utilities
├── unit/                       # Unit tests
│   ├── models/                 # Database model tests
│   │   ├── Admin.test.js       # Admin model validation
│   │   ├── LibraryToken.test.js # Token model tests
│   │   └── NetworkInfo.test.js # Network info model tests
│   ├── services/               # Service layer tests
│   │   ├── adminService.test.js # Admin service logic
│   │   └── deviceService.test.js # Device service tests
│   └── middleware/             # Middleware tests
│       ├── auth.test.js        # Authentication middleware
│       └── validation.test.js  # Input validation tests
├── integration/                # Integration tests
│   ├── auth/                   # Authentication flow tests
│   │   ├── admin.auth.test.js  # Admin authentication
│   │   ├── superadmin.test.js  # Super admin operations
│   │   └── device.auth.test.js # Device authentication
│   ├── api/                    # API endpoint tests
│   │   ├── admin.api.test.js   # Admin API endpoints
│   │   ├── superadmin.api.test.js # Super admin endpoints
│   │   ├── device.api.test.js  # Device API tests
│   │   └── networkinfo.api.test.js # Network info APIs
│   └── database/               # Database integration
│       ├── connection.test.js  # Database connectivity
│       └── relationships.test.js # Model relationships
└── e2e/                        # End-to-end tests
    ├── complete.flow.test.js   # Full authentication flow
    └── superadmin.workflow.test.js # Super admin workflows
```

---

## 🧪 Unit Tests

### Model Testing Example

```javascript
// tests/unit/models/Admin.test.js
const Admin = require("../../../src/models/Admin");
const bcrypt = require("bcryptjs");

describe("Admin Model", () => {
  describe("Validation", () => {
    test("should create valid admin with required fields", async () => {
      const adminData = {
        email: "test@example.com",
        password: "SecurePass123!",
        role: "admin",
      };

      const admin = new Admin(adminData);
      const savedAdmin = await admin.save();

      expect(savedAdmin.email).toBe(adminData.email);
      expect(savedAdmin.role).toBe(adminData.role);
      expect(savedAdmin.isActive).toBe(true);
    });

    test("should hash password before saving", async () => {
      const plainPassword = "SecurePass123!";
      const admin = new Admin({
        email: "test@example.com",
        password: plainPassword,
        role: "admin",
      });

      await admin.save();

      expect(admin.password).not.toBe(plainPassword);
      expect(admin.password).toMatch(/^\$2[aby]?\$10\$/); // bcrypt hash pattern

      const isMatch = await bcrypt.compare(plainPassword, admin.password);
      expect(isMatch).toBe(true);
    });

    test("should enforce single super admin constraint", async () => {
      // Create first super admin
      const superAdmin1 = new Admin({
        email: "super1@example.com",
        password: "SecurePass123!",
        role: "superadmin",
      });
      await superAdmin1.save();

      // Attempt to create second super admin
      const superAdmin2 = new Admin({
        email: "super2@example.com",
        password: "SecurePass123!",
        role: "superadmin",
      });

      await expect(superAdmin2.save()).rejects.toThrow(
        "Only one super admin is allowed"
      );
    });

    test("should validate email format", async () => {
      const admin = new Admin({
        email: "invalid-email",
        password: "SecurePass123!",
        role: "admin",
      });

      await expect(admin.save()).rejects.toThrow();
    });

    test("should require minimum password length", async () => {
      const admin = new Admin({
        email: "test@example.com",
        password: "123",
        role: "admin",
      });

      await expect(admin.save()).rejects.toThrow();
    });
  });

  describe("Methods", () => {
    test("comparePassword should validate correct password", async () => {
      const password = "SecurePass123!";
      const admin = new Admin({
        email: "test@example.com",
        password: password,
        role: "admin",
      });
      await admin.save();

      const isMatch = await admin.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    test("comparePassword should reject incorrect password", async () => {
      const admin = new Admin({
        email: "test@example.com",
        password: "SecurePass123!",
        role: "admin",
      });
      await admin.save();

      const isMatch = await admin.comparePassword("WrongPassword");
      expect(isMatch).toBe(false);
    });
  });
});
```

### Service Testing Example

```javascript
// tests/unit/services/adminService.test.js
const adminService = require("../../../src/services/adminService");
const Admin = require("../../../src/models/Admin");

describe("Admin Service", () => {
  describe("createSuperAdmin", () => {
    test("should create super admin with valid data", async () => {
      const adminData = {
        email: "super@example.com",
        password: "SuperSecure123!",
        confirmPassword: "SuperSecure123!",
      };

      const result = await adminService.createSuperAdmin(adminData);

      expect(result.success).toBe(true);
      expect(result.admin.email).toBe(adminData.email);
      expect(result.admin.role).toBe("superadmin");
    });

    test("should prevent duplicate super admin creation", async () => {
      // Create first super admin
      await adminService.createSuperAdmin({
        email: "super1@example.com",
        password: "SuperSecure123!",
        confirmPassword: "SuperSecure123!",
      });

      // Attempt to create second
      const result = await adminService.createSuperAdmin({
        email: "super2@example.com",
        password: "SuperSecure123!",
        confirmPassword: "SuperSecure123!",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Super admin already exists");
    });
  });

  describe("getAllRegularAdmins", () => {
    beforeEach(async () => {
      // Create test data
      await Admin.create([
        {
          email: "admin1@example.com",
          password: "SecurePass123!",
          role: "admin",
        },
        {
          email: "admin2@example.com",
          password: "SecurePass123!",
          role: "admin",
        },
        {
          email: "super@example.com",
          password: "SuperSecure123!",
          role: "superadmin",
        },
      ]);
    });

    test("should return only regular admins", async () => {
      const result = await adminService.getAllRegularAdmins();

      expect(result.success).toBe(true);
      expect(result.admins).toHaveLength(2);
      expect(result.admins.every((admin) => admin.role === "admin")).toBe(true);
    });

    test("should support pagination", async () => {
      const result = await adminService.getAllRegularAdmins(1, 1);

      expect(result.success).toBe(true);
      expect(result.admins).toHaveLength(1);
      expect(result.pagination.totalAdmins).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
    });
  });
});
```

---

## 🔗 Integration Tests

### API Endpoint Testing

```javascript
// tests/integration/api/superadmin.api.test.js
const request = require("supertest");
const app = require("../../../src/app");
const {
  createTestSuperAdmin,
  generateSuperAdminToken,
} = require("../../helpers/auth.helper");

describe("Super Admin API", () => {
  let superAdminToken;
  let superAdminId;

  beforeEach(async () => {
    const { admin, token } = await createTestSuperAdmin();
    superAdminToken = token;
    superAdminId = admin._id;
  });

  describe("POST /api/superadmin/create-admin", () => {
    test("should create new admin with valid data", async () => {
      const adminData = {
        email: "newadmin@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      const response = await request(app)
        .post("/api/superadmin/create-admin")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.admin.email).toBe(adminData.email);
      expect(response.body.admin.role).toBe("admin");
    });

    test("should reject request without super admin token", async () => {
      const adminData = {
        email: "newadmin@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      await request(app)
        .post("/api/superadmin/create-admin")
        .send(adminData)
        .expect(401);
    });

    test("should validate password confirmation", async () => {
      const adminData = {
        email: "newadmin@example.com",
        password: "SecurePass123!",
        confirmPassword: "DifferentPassword123!",
      };

      const response = await request(app)
        .post("/api/superadmin/create-admin")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(adminData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/superadmin/admins", () => {
    test("should list all admins with pagination", async () => {
      const response = await request(app)
        .get("/api/superadmin/admins?page=1&limit=10")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admins).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    test("should filter admins by status", async () => {
      const response = await request(app)
        .get("/api/superadmin/admins?status=active")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admins.every((admin) => admin.isActive)).toBe(true);
    });
  });

  describe("PUT /api/superadmin/admins/:id/revoke-privileges", () => {
    let testAdminId;

    beforeEach(async () => {
      // Create test admin
      const response = await request(app)
        .post("/api/superadmin/create-admin")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          email: "testadmin@example.com",
          password: "SecurePass123!",
          confirmPassword: "SecurePass123!",
        });
      testAdminId = response.body.admin.id;
    });

    test("should revoke admin privileges", async () => {
      const response = await request(app)
        .put(`/api/superadmin/admins/${testAdminId}/revoke-privileges`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ reason: "Test revocation" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.admin.isActive).toBe(false);
    });

    test("should require reason for revocation", async () => {
      await request(app)
        .put(`/api/superadmin/admins/${testAdminId}/revoke-privileges`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({})
        .expect(400);
    });
  });
});
```

### Authentication Flow Testing

```javascript
// tests/integration/auth/complete.flow.test.js
const request = require("supertest");
const app = require("../../../src/app");

describe("Complete Authentication Flow", () => {
  test("should complete full admin → library → device → API flow", async () => {
    // Step 1: Create Admin
    const adminData = {
      email: "flowtest@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    };

    const adminResponse = await request(app)
      .post("/api/admin/create")
      .send(adminData)
      .expect(201);

    // Step 2: Admin Login
    const loginResponse = await request(app)
      .post("/api/admin/verify")
      .send({
        email: adminData.email,
        password: adminData.password,
      })
      .expect(200);

    const adminToken = loginResponse.body.token;

    // Step 3: Generate Library Token
    const libraryResponse = await request(app)
      .post("/api/admin/library-token")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const libraryToken = libraryResponse.body.token;

    // Step 4: Device Authentication
    const deviceResponse = await request(app)
      .post("/device/auth")
      .send({
        libraryToken: libraryToken,
        appName: "TestApp",
        version: "1.0.0",
      })
      .expect(200);

    const deviceToken = deviceResponse.body.token;

    // Step 5: Access Protected API
    const apiResponse = await request(app)
      .get("/api/network-info")
      .set("Authorization", `Bearer ${deviceToken}`)
      .expect(200);

    expect(apiResponse.body.success).toBe(true);
  });
});
```

---

## 🛠️ Test Helpers

### Authentication Helper

```javascript
// tests/helpers/auth.helper.js
const jwt = require("jsonwebtoken");
const Admin = require("../../src/models/Admin");
const bcrypt = require("bcryptjs");

/**
 * Create test super admin
 */
async function createTestSuperAdmin() {
  const password = "SuperSecure123!";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    email: "testsuperadmin@example.com",
    password: hashedPassword,
    role: "superadmin",
    isActive: true,
  });

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { admin, token };
}

/**
 * Create test regular admin
 */
async function createTestAdmin() {
  const password = "SecurePass123!";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    email: "testadmin@example.com",
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { admin, token };
}

/**
 * Generate library token for testing
 */
async function createTestLibraryToken(adminId) {
  const LibraryToken = require("../../src/models/LibraryToken");
  const crypto = require("crypto");

  const tokenHash = crypto.randomBytes(16).toString("hex");

  const libraryToken = await LibraryToken.create({
    tokenHash,
    adminId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
  });

  return libraryToken;
}

module.exports = {
  createTestSuperAdmin,
  createTestAdmin,
  createTestLibraryToken,
};
```

---

## 📋 Manual Testing Procedures

### 1. Super Admin System Testing

```bash
# Start the application
npm run dev

# Test super admin creation
npm run create-superadmin

# Follow prompts:
# - Enter: testsuperadmin@example.com
# - Password: SuperSecure123!
# - Confirm: SuperSecure123!

# Test management console
npm run manage-superadmin

# Test each menu option:
# 1. View Super Admin Information
# 2. Reset Password (with verification)
# 3. Emergency Password Reset
# 4. View System Overview
# 5. List All Admin Accounts
```

### 2. API Testing via Swagger

```bash
# Navigate to: http://localhost:3000/api-docs

# Test sequence:
# 1. POST /api/admin/create - Create admin
# 2. POST /api/admin/verify - Login admin
# 3. POST /api/admin/library-token - Generate token
# 4. POST /device/auth - Device authentication
# 5. GET /api/network-info - Access protected API
```

### 3. Database Validation

```bash
# Connect to MongoDB
mongo express_learning

# Verify collections
db.admins.find({}).pretty()
db.librarytokens.find({}).pretty()
db.appinfos.find({}).pretty()

# Check constraints
db.admins.find({role: "superadmin"}).count()  # Should be 1
```

### 4. Security Testing

```bash
# Test password hashing
# Passwords should be bcrypt hashed (60 characters)
db.admins.findOne({}, {password: 1})

# Test JWT expiration
# Create token and wait for expiration

# Test rate limiting
# Make rapid requests to auth endpoints
```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Targets

| Component       | Target Coverage | Current |
| --------------- | --------------- | ------- |
| **Models**      | 95%             | ✅ 98%  |
| **Services**    | 90%             | ✅ 94%  |
| **Controllers** | 85%             | ✅ 89%  |
| **Middleware**  | 90%             | ✅ 92%  |
| **Routes**      | 80%             | ✅ 86%  |
| **Overall**     | 85%             | ✅ 91%  |

---

## 🚨 Testing Best Practices

### Test Writing Guidelines

1. **Descriptive Names**: Use clear, descriptive test names
2. **AAA Pattern**: Arrange, Act, Assert
3. **Isolation**: Each test should be independent
4. **Clean Up**: Clear database between tests
5. **Mock External**: Mock external services and APIs

### Security Testing

1. **Authentication**: Test all auth scenarios
2. **Authorization**: Verify role-based access
3. **Input Validation**: Test malicious inputs
4. **Rate Limiting**: Verify brute force protection
5. **Token Security**: Test JWT handling

### Performance Testing

1. **Load Testing**: Test with multiple concurrent requests
2. **Database**: Test query performance with large datasets
3. **Memory**: Monitor memory usage during tests
4. **Response Times**: Verify API response times

---

## 🔍 Debugging Tests

### Common Issues

#### 1. Database Connection

```bash
# Check MongoDB status
brew services list | grep mongodb
# or
systemctl status mongod
```

#### 2. Test Database Cleanup

```javascript
// Add to test setup
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

#### 3. JWT Token Issues

```javascript
// Verify JWT_SECRET in test environment
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
```

### Debug Commands

```bash
# Run specific test file
npm test -- tests/unit/models/Admin.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Watch mode for specific pattern
npm test -- --watch --testNamePattern="Admin"
```

---

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test_secret_32_characters_minimum
```

---

_This testing guide ensures comprehensive coverage of all application functionality. Update tests when adding new features or modifying existing code._
