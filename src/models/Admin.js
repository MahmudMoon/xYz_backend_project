const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

/**
 * Admin Schema for MongoDB
 * Stores admin user credentials and authentication details
 */
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

// Virtual for checking if account is locked
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ isActive: 1 });
adminSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Instance method to generate JWT token
adminSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    type: "admin",
  };

  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    issuer: "express_learning_api",
    audience: "admin",
  };

  return jwt.sign(payload, secret, options);
};

// Static method to verify JWT token
adminSchema.statics.verifyToken = function (token) {
  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  // If we're at max attempts and not locked, lock the account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + lockTime,
    };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
    $set: {
      lastLogin: Date.now(),
    },
  });
};

// Transform output when converting to JSON
adminSchema.methods.toJSON = function () {
  const admin = this.toObject();

  // Remove sensitive fields
  delete admin.password;
  delete admin.loginAttempts;
  delete admin.lockUntil;

  // Transform _id to id
  admin.id = admin._id;
  delete admin._id;
  delete admin.__v;

  return admin;
};

// Static methods for common operations
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

adminSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select(
    "+password"
  );
};

// Pre-remove middleware
adminSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  console.log(`Admin with email ${this.email} is being deleted`);
  next();
});

// Post-save middleware
adminSchema.post("save", function (doc, next) {
  console.log(`Admin ${doc.email} has been saved`);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
