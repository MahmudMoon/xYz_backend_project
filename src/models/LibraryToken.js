const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;

/**
 * LibraryToken Schema for MongoDB
 * Stores unique hash tokens created by admins for library access
 */
const libraryTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      length: [32, "Token must be exactly 32 characters long"],
      match: [
        /^[a-f0-9]{32}$/,
        "Token must be a valid 32-character hexadecimal string",
      ],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Created by admin ID is required"],
      index: true,
    },
    validity: {
      type: Date,
      required: [true, "Validity date is required"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, "Description cannot exceed 255 characters"],
      default: "",
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "Library_Token",
  }
);

// Compound indexes for better query performance
libraryTokenSchema.index({ token: 1, isActive: 1 });
libraryTokenSchema.index({ createdBy: 1, createdAt: -1 });
libraryTokenSchema.index({ validity: 1, isActive: 1 });
libraryTokenSchema.index({ createdAt: -1 });

// Virtual for checking if token is expired
libraryTokenSchema.virtual("isExpired").get(function () {
  return new Date() > this.validity;
});

// Virtual for checking if token is valid (active and not expired)
libraryTokenSchema.virtual("isValid").get(function () {
  return this.isActive && !this.isExpired;
});

// Static method to generate a unique 32-character token
libraryTokenSchema.statics.generateUniqueToken = async function () {
  let token;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate a random 32-character hexadecimal string
    token = crypto.randomBytes(16).toString("hex");

    // Check if token already exists
    const existingToken = await this.findOne({ token });

    if (!existingToken) {
      isUnique = true;
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique token after maximum attempts");
  }

  return token;
};

// Static method to find valid tokens
libraryTokenSchema.statics.findValidTokens = function (query = {}) {
  return this.find({
    ...query,
    isActive: true,
    validity: { $gt: new Date() },
  }).populate("createdBy", "email createdAt");
};

// Static method to find token by value
libraryTokenSchema.statics.findByToken = function (token) {
  return this.findOne({ token }).populate("createdBy", "email createdAt");
};

// Instance method to deactivate token
libraryTokenSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Instance method to extend validity
libraryTokenSchema.methods.extendValidity = function (additionalDays = 30) {
  const currentValidity = new Date(this.validity);
  currentValidity.setDate(currentValidity.getDate() + additionalDays);
  this.validity = currentValidity;
  return this.save();
};

// Instance method to record usage
libraryTokenSchema.methods.recordUsage = function () {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Pre-save middleware
libraryTokenSchema.pre("save", function (next) {
  // Ensure token is lowercase
  if (this.isModified("token")) {
    this.token = this.token.toLowerCase();
  }

  next();
});

// Transform output when converting to JSON
libraryTokenSchema.methods.toJSON = function () {
  const tokenObj = this.toObject();

  // Transform _id to id
  tokenObj.id = tokenObj._id;
  delete tokenObj._id;
  delete tokenObj.__v;

  // Add computed fields
  tokenObj.isExpired = this.isExpired;
  tokenObj.isValid = this.isValid;

  return tokenObj;
};

// Static method to cleanup expired tokens
libraryTokenSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [{ validity: { $lt: new Date() } }, { isActive: false }],
  });
};

// Static method to get token statistics
libraryTokenSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: 1 },
        activeTokens: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
        expiredTokens: {
          $sum: {
            $cond: [{ $lt: ["$validity", new Date()] }, 1, 0],
          },
        },
        validTokens: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isActive", true] },
                  { $gt: ["$validity", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalUsage: { $sum: "$usageCount" },
        avgUsage: { $avg: "$usageCount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalTokens: 0,
      activeTokens: 0,
      expiredTokens: 0,
      validTokens: 0,
      totalUsage: 0,
      avgUsage: 0,
    }
  );
};

// Post-save middleware
libraryTokenSchema.post("save", function (doc, next) {
  console.log(
    `Library token ${doc.token} has been saved by admin ${doc.createdBy}`
  );
  next();
});

// Pre-remove middleware
libraryTokenSchema.pre(
  "deleteOne",
  { document: true, query: false },
  function (next) {
    console.log(`Library token ${this.token} is being deleted`);
    next();
  }
);

const LibraryToken = mongoose.model("LibraryToken", libraryTokenSchema);

module.exports = LibraryToken;
