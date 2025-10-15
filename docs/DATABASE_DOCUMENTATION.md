# 🗄️ Database Documentation - Express Learning Project

## 📋 Overview

Complete database documentation for the MongoDB-based Express.js application, covering schema design, relationships, indexes, and data management procedures.

---

## 🏗️ Database Architecture

### Technology Stack

- **Database**: MongoDB 6.0+
- **ODM**: Mongoose 8.19.1
- **Connection**: Native MongoDB driver with connection pooling
- **Authentication**: SCRAM-SHA-256
- **Encryption**: TLS/SSL in production

### Connection Configuration

```javascript
// src/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
```

---

## 📊 Database Schema

### Collections Overview

```mermaid
erDiagram
    Admin ||--o{ LibraryToken : creates
    Admin ||--o{ Admin : manages
    LibraryToken ||--o{ AppInfo : authenticates
    AppInfo ||--o{ NetworkInfo : owns

    Admin {
        ObjectId _id PK
        String email UK
        String password
        String role
        Boolean isActive
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    LibraryToken {
        ObjectId _id PK
        String tokenHash UK
        ObjectId adminId FK
        Date expiresAt
        Boolean isActive
        Number usageCount
        Date lastUsedAt
        Date createdAt
        Date updatedAt
    }

    AppInfo {
        ObjectId _id PK
        String appName
        String version
        String deviceId UK
        ObjectId libraryTokenId FK
        Boolean isActive
        Date lastAccessAt
        Date createdAt
        Date updatedAt
    }

    NetworkInfo {
        ObjectId _id PK
        String name
        String ssid
        String password
        String securityType
        String frequency
        ObjectId appInfoId FK
        Date createdAt
        Date updatedAt
    }
```

---

## 👤 Admin Collection

### Schema Definition

```javascript
// src/models/Admin.js
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
      maxlength: [255, "Email cannot exceed 255 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude from queries by default
    },

    role: {
      type: String,
      enum: {
        values: ["admin", "superadmin"],
        message: "Role must be either admin or superadmin",
      },
      default: "admin",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
```

### Indexes

```javascript
// Compound index for efficient queries
adminSchema.index({ email: 1, isActive: 1 });
adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ createdBy: 1 });
adminSchema.index({ createdAt: -1 });
```

### Pre-save Middleware

```javascript
// Password hashing and super admin constraint
adminSchema.pre("save", async function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Enforce single super admin constraint
  if (this.role === "superadmin" && this.isNew) {
    const existingSuperAdmin = await this.constructor.findOne({
      role: "superadmin",
    });

    if (existingSuperAdmin) {
      throw new Error("Only one super admin is allowed in the system");
    }
  }

  next();
});
```

### Instance Methods

```javascript
// Password comparison
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Check if super admin
adminSchema.methods.isSuperAdmin = function () {
  return this.role === "superadmin";
};
```

### Example Documents

```javascript
// Super Admin Document
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "superadmin@example.com",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LsKhBT1cWvn1p4ePu",
  "role": "superadmin",
  "isActive": true,
  "createdBy": null,
  "lastLoginAt": "2025-10-15T10:30:00.000Z",
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-15T10:30:00.000Z"
}

// Regular Admin Document
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "email": "admin@example.com",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LsKhBT1cWvn1p4ePu",
  "role": "admin",
  "isActive": true,
  "createdBy": ObjectId("507f1f77bcf86cd799439011"),
  "lastLoginAt": "2025-10-15T11:00:00.000Z",
  "createdAt": "2025-10-02T09:00:00.000Z",
  "updatedAt": "2025-10-15T11:00:00.000Z"
}
```

---

## 🎫 LibraryToken Collection

### Schema Definition

```javascript
// src/models/LibraryToken.js
const libraryTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true,
      length: [32, "Token hash must be exactly 32 characters"],
      match: [/^[a-f0-9]{32}$/, "Token hash must be a valid hex string"],
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expireAfterSeconds: 0 }, // TTL index
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    description: {
      type: String,
      maxlength: [255, "Description cannot exceed 255 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
```

### Indexes

```javascript
libraryTokenSchema.index({ tokenHash: 1, isActive: 1 });
libraryTokenSchema.index({ adminId: 1, isActive: 1 });
libraryTokenSchema.index({ expiresAt: 1 });
libraryTokenSchema.index({ createdAt: -1 });
```

### Instance Methods

```javascript
// Check if token is expired
libraryTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Increment usage count
libraryTokenSchema.methods.incrementUsage = async function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return await this.save();
};

// Deactivate token
libraryTokenSchema.methods.deactivate = async function () {
  this.isActive = false;
  return await this.save();
};
```

### Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "tokenHash": "a1b2c3d4e5f6789012345678901234567890abcd",
  "adminId": ObjectId("507f1f77bcf86cd799439012"),
  "expiresAt": "2025-11-15T10:00:00.000Z",
  "isActive": true,
  "usageCount": 15,
  "lastUsedAt": "2025-10-15T09:30:00.000Z",
  "description": "Mobile app library token",
  "createdAt": "2025-10-01T10:00:00.000Z",
  "updatedAt": "2025-10-15T09:30:00.000Z"
}
```

---

## 📱 AppInfo Collection

### Schema Definition

```javascript
// src/models/AppInfo.js
const appInfoSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: [true, "App name is required"],
      trim: true,
      maxlength: [100, "App name cannot exceed 100 characters"],
      match: [/^[a-zA-Z0-9\s\-_]+$/, "App name contains invalid characters"],
    },

    version: {
      type: String,
      required: [true, "App version is required"],
      trim: true,
      maxlength: [20, "Version cannot exceed 20 characters"],
      match: [
        /^\d+\.\d+\.\d+$/,
        "Version must follow semantic versioning (x.y.z)",
      ],
    },

    deviceId: {
      type: String,
      required: [true, "Device ID is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Device ID cannot exceed 100 characters"],
    },

    libraryTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryToken",
      required: [true, "Library token ID is required"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastAccessAt: {
      type: Date,
      default: Date.now,
    },

    deviceInfo: {
      platform: {
        type: String,
        enum: ["iOS", "Android", "Web", "Desktop", "Other"],
        default: "Other",
      },
      osVersion: {
        type: String,
        maxlength: [50, "OS version cannot exceed 50 characters"],
      },
      appVersion: {
        type: String,
        maxlength: [20, "App version cannot exceed 20 characters"],
      },
    },
  },
  {
    timestamps: true,
  }
);
```

### Indexes

```javascript
appInfoSchema.index({ deviceId: 1, isActive: 1 });
appInfoSchema.index({ libraryTokenId: 1, isActive: 1 });
appInfoSchema.index({ appName: 1, version: 1 });
appInfoSchema.index({ lastAccessAt: -1 });
```

### Instance Methods

```javascript
// Update last access time
appInfoSchema.methods.updateLastAccess = async function () {
  this.lastAccessAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Deactivate app
appInfoSchema.methods.deactivate = async function () {
  this.isActive = false;
  return await this.save();
};
```

### Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "appName": "NetworkManager",
  "version": "1.2.3",
  "deviceId": "device_12345_unique_identifier",
  "libraryTokenId": ObjectId("507f1f77bcf86cd799439013"),
  "isActive": true,
  "lastAccessAt": "2025-10-15T12:00:00.000Z",
  "deviceInfo": {
    "platform": "iOS",
    "osVersion": "16.1",
    "appVersion": "1.2.3"
  },
  "createdAt": "2025-10-01T11:00:00.000Z",
  "updatedAt": "2025-10-15T12:00:00.000Z"
}
```

---

## 🌐 NetworkInfo Collection

### Schema Definition

```javascript
// src/models/NetworkInfo.js
const networkInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Network name is required"],
      trim: true,
      maxlength: [100, "Network name cannot exceed 100 characters"],
    },

    ssid: {
      type: String,
      required: [true, "SSID is required"],
      trim: true,
      maxlength: [32, "SSID cannot exceed 32 characters"], // WiFi standard limit
    },

    password: {
      type: String,
      required: function () {
        return this.securityType !== "open";
      },
      trim: true,
      maxlength: [128, "Password cannot exceed 128 characters"],
    },

    securityType: {
      type: String,
      required: [true, "Security type is required"],
      enum: {
        values: ["open", "wep", "wpa", "wpa2", "wpa3"],
        message: "Security type must be one of: open, wep, wpa, wpa2, wpa3",
      },
      default: "wpa2",
    },

    frequency: {
      type: String,
      enum: {
        values: ["2.4GHz", "5GHz", "6GHz", "dual-band", "tri-band"],
        message:
          "Frequency must be one of: 2.4GHz, 5GHz, 6GHz, dual-band, tri-band",
      },
      default: "2.4GHz",
    },

    appInfoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppInfo",
      required: [true, "App info ID is required"],
      index: true,
    },

    isHidden: {
      type: Boolean,
      default: false,
    },

    signalStrength: {
      type: Number,
      min: [-100, "Signal strength cannot be less than -100 dBm"],
      max: [0, "Signal strength cannot be greater than 0 dBm"],
      default: null,
    },

    priority: {
      type: Number,
      min: [1, "Priority must be at least 1"],
      max: [10, "Priority cannot exceed 10"],
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);
```

### Indexes

```javascript
networkInfoSchema.index({ appInfoId: 1, name: 1 });
networkInfoSchema.index({ ssid: 1, appInfoId: 1 });
networkInfoSchema.index({ securityType: 1 });
networkInfoSchema.index({ frequency: 1 });
networkInfoSchema.index({ priority: -1 });
networkInfoSchema.index({ createdAt: -1 });
```

### Instance Methods

```javascript
// Check if network is secure
networkInfoSchema.methods.isSecure = function () {
  return this.securityType !== "open";
};

// Get security level
networkInfoSchema.methods.getSecurityLevel = function () {
  const levels = {
    open: 0,
    wep: 1,
    wpa: 2,
    wpa2: 3,
    wpa3: 4,
  };
  return levels[this.securityType] || 0;
};
```

### Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "name": "Home WiFi Network",
  "ssid": "MyHomeWiFi_5G",
  "password": "SecurePassword123!",
  "securityType": "wpa3",
  "frequency": "5GHz",
  "appInfoId": ObjectId("507f1f77bcf86cd799439014"),
  "isHidden": false,
  "signalStrength": -45,
  "priority": 8,
  "createdAt": "2025-10-01T12:00:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z"
}
```

---

## 🔍 Database Queries & Operations

### Common Query Patterns

#### Admin Queries

```javascript
// Find super admin with password
const superAdmin = await Admin.findOne({ role: "superadmin" }).select(
  "+password"
);

// Get active admins with pagination
const admins = await Admin.find({
  role: "admin",
  isActive: true,
})
  .populate("createdBy", "email")
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(page * 10);

// Admin statistics
const stats = await Admin.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
      active: {
        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
      },
    },
  },
]);
```

#### Library Token Queries

```javascript
// Find active tokens for admin
const tokens = await LibraryToken.find({
  adminId: adminId,
  isActive: true,
  expiresAt: { $gt: new Date() },
}).populate("adminId", "email");

// Token usage statistics
const tokenStats = await LibraryToken.aggregate([
  {
    $group: {
      _id: "$adminId",
      totalTokens: { $sum: 1 },
      totalUsage: { $sum: "$usageCount" },
      activeTokens: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$isActive", true] },
                { $gt: ["$expiresAt", new Date()] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
]);
```

#### Network Info Queries

```javascript
// Get network info for device with security filtering
const networks = await NetworkInfo.find({
  appInfoId: appId,
})
  .populate({
    path: "appInfoId",
    populate: {
      path: "libraryTokenId",
      select: "adminId",
    },
  })
  .sort({ priority: -1, createdAt: -1 });

// Network statistics by security type
const securityStats = await NetworkInfo.aggregate([
  {
    $group: {
      _id: "$securityType",
      count: { $sum: 1 },
      avgSignalStrength: { $avg: "$signalStrength" },
    },
  },
  { $sort: { count: -1 } },
]);
```

---

## 📈 Performance Optimization

### Index Strategy

```javascript
// Compound indexes for common query patterns
db.admins.createIndex({ email: 1, isActive: 1 });
db.librarytokens.createIndex({ adminId: 1, isActive: 1, expiresAt: 1 });
db.appinfos.createIndex({ libraryTokenId: 1, isActive: 1 });
db.networkinfos.createIndex({ appInfoId: 1, priority: -1 });

// Text search indexes
db.networkinfos.createIndex(
  {
    name: "text",
    ssid: "text",
  },
  {
    weights: { name: 10, ssid: 5 },
  }
);

// TTL indexes for automatic cleanup
db.librarytokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Query Optimization

```javascript
// Use projection to limit fields
const admins = await Admin.find(
  { isActive: true },
  { email: 1, role: 1, createdAt: 1 }
);

// Use lean() for read-only operations
const tokenCount = await LibraryToken.countDocuments({
  adminId: adminId,
  isActive: true,
}).lean();

// Aggregate for complex statistics
const dailyStats = await NetworkInfo.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
        },
      },
      count: { $sum: 1 },
      securityTypes: { $addToSet: "$securityType" },
    },
  },
  { $sort: { _id: -1 } },
]);
```

---

## 🛡️ Data Security & Validation

### Security Measures

```javascript
// Password encryption in Admin model
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Sensitive field exclusion
adminSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Network password encryption (optional enhancement)
networkInfoSchema.pre("save", function (next) {
  if (this.isModified("password") && this.password) {
    // Implement encryption if needed for additional security
    // this.password = encrypt(this.password);
  }
  next();
});
```

### Validation Rules

```javascript
// Custom validators
const emailValidator = {
  validator: async function (email) {
    if (!this.isNew) return true; // Skip for updates
    const user = await this.constructor.findOne({ email });
    return !user;
  },
  message: "Email address is already in use",
};

// SSID validation
const ssidValidator = {
  validator: function (ssid) {
    // WiFi SSID validation rules
    return ssid.length <= 32 && !/[^\x20-\x7E]/.test(ssid);
  },
  message: "SSID must be 32 characters or less with printable ASCII characters",
};
```

---

## 🔄 Backup & Recovery

### Backup Procedures

```bash
# Full database backup
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/dbname" --out ./backup/$(date +%Y%m%d_%H%M%S)

# Collection-specific backup
mongodump --uri "mongodb+srv://..." --collection admins --out ./backup/admins_$(date +%Y%m%d)

# Compressed backup
mongodump --uri "mongodb+srv://..." --gzip --archive=backup_$(date +%Y%m%d).gz
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname"

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Perform backup
mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed files
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Recovery Procedures

```bash
# Full database restore
mongorestore --uri "mongodb+srv://..." --drop ./backup/20251015_120000/

# Collection restore
mongorestore --uri "mongodb+srv://..." --collection admins ./backup/20251015_120000/dbname/admins.bson

# Restore from compressed backup
tar -xzf backup_20251015_120000.tar.gz
mongorestore --uri "mongodb+srv://..." --drop ./20251015_120000/
```

---

## 📊 Monitoring & Maintenance

### Database Health Monitoring

```javascript
// Health check queries
const dbHealth = async () => {
  try {
    // Connection check
    const isConnected = mongoose.connection.readyState === 1;

    // Collection stats
    const adminCount = await Admin.countDocuments();
    const tokenCount = await LibraryToken.countDocuments({ isActive: true });
    const appCount = await AppInfo.countDocuments({ isActive: true });
    const networkCount = await NetworkInfo.countDocuments();

    // Recent activity
    const recentLogins = await Admin.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return {
      connected: isConnected,
      collections: {
        admins: adminCount,
        activeTokens: tokenCount,
        activeApps: appCount,
        networks: networkCount,
      },
      activity: {
        recentLogins,
      },
    };
  } catch (error) {
    return { error: error.message };
  }
};
```

### Maintenance Tasks

```javascript
// Cleanup expired tokens
const cleanupExpiredTokens = async () => {
  const result = await LibraryToken.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      {
        isActive: false,
        createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    ],
  });

  console.log(`Cleaned up ${result.deletedCount} expired tokens`);
  return result.deletedCount;
};

// Update usage statistics
const updateUsageStats = async () => {
  const pipeline = [
    {
      $lookup: {
        from: "appinfos",
        localField: "_id",
        foreignField: "libraryTokenId",
        as: "apps",
      },
    },
    {
      $addFields: {
        appCount: { $size: "$apps" },
        totalNetworks: {
          $sum: {
            $map: {
              input: "$apps",
              as: "app",
              in: { $size: { $ifNull: ["$$app.networks", []] } },
            },
          },
        },
      },
    },
  ];

  const stats = await LibraryToken.aggregate(pipeline);
  return stats;
};
```

---

## 🔧 Development Tools

### Database Seeding

```javascript
// seeds/admin.seed.js
const seedAdmins = async () => {
  await Admin.deleteMany({});

  const superAdmin = new Admin({
    email: "superadmin@example.com",
    password: "SuperSecure123!",
    role: "superadmin",
  });

  await superAdmin.save();

  const regularAdmins = await Admin.insertMany([
    {
      email: "admin1@example.com",
      password: "SecurePass123!",
      role: "admin",
      createdBy: superAdmin._id,
    },
    {
      email: "admin2@example.com",
      password: "SecurePass123!",
      role: "admin",
      createdBy: superAdmin._id,
    },
  ]);

  console.log("Admins seeded successfully");
  return { superAdmin, regularAdmins };
};
```

### Migration Scripts

```javascript
// migrations/001_add_device_info.js
const migration001 = async () => {
  console.log("Running migration: Add device info to AppInfo collection");

  const result = await AppInfo.updateMany(
    { deviceInfo: { $exists: false } },
    {
      $set: {
        deviceInfo: {
          platform: "Other",
          osVersion: "Unknown",
          appVersion: "1.0.0",
        },
      },
    }
  );

  console.log(`Updated ${result.modifiedCount} documents`);
  return result;
};
```

---

_This database documentation provides complete coverage of the MongoDB schema, operations, and maintenance procedures for the Express Learning Project._
