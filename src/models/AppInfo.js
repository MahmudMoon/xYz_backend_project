const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * AppInfo Schema for MongoDB
 * Stores device application information for authenticated devices
 */
const appInfoSchema = new Schema(
  {
    appName: {
      type: String,
      required: [true, "App name is required"],
      trim: true,
      maxlength: [100, "App name cannot exceed 100 characters"],
      minlength: [2, "App name must be at least 2 characters long"],
      index: true,
    },
    version: {
      type: String,
      required: [true, "App version is required"],
      trim: true,
      maxlength: [20, "Version cannot exceed 20 characters"],
      match: [
        /^(\d+\.)?(\d+\.)?(\*|\d+)(-[a-zA-Z0-9]+)?$/,
        "Version must follow semantic versioning format (e.g., 1.0.0, 2.1.3-beta)",
      ],
    },
    libraryToken: {
      type: String,
      required: [true, "Library token is required"],
      length: [32, "Library token must be exactly 32 characters"],
      match: [
        /^[a-f0-9]{32}$/,
        "Library token must be a valid 32-character hexadecimal string",
      ],
      index: true,
    },
    deviceFingerprint: {
      type: String,
      trim: true,
      maxlength: [255, "Device fingerprint cannot exceed 255 characters"],
      default: null,
    },
    lastAuthAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    authCount: {
      type: Number,
      default: 1,
      min: [1, "Auth count must be at least 1"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      userAgent: {
        type: String,
        trim: true,
        maxlength: [500, "User agent cannot exceed 500 characters"],
        default: null,
      },
      ipAddress: {
        type: String,
        trim: true,
        maxlength: [45, "IP address cannot exceed 45 characters"], // IPv6 max length
        default: null,
      },
      platform: {
        type: String,
        trim: true,
        maxlength: [50, "Platform cannot exceed 50 characters"],
        default: null,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: "app_info",
  }
);

// Compound indexes for better query performance
appInfoSchema.index({ appName: 1, version: 1 }, { unique: false });
appInfoSchema.index({ libraryToken: 1, appName: 1 });
appInfoSchema.index({ createdAt: -1 });
appInfoSchema.index({ lastAuthAt: -1 });
appInfoSchema.index({ isActive: 1, lastAuthAt: -1 });

// Virtual for app identifier
appInfoSchema.virtual("appIdentifier").get(function () {
  return `${this.appName}@${this.version}`;
});

// Static method to find by app name and version
appInfoSchema.statics.findByAppAndVersion = function (appName, version) {
  return this.findOne({ appName, version, isActive: true });
};

// Static method to find by library token
appInfoSchema.statics.findByLibraryToken = function (libraryToken) {
  return this.find({ libraryToken, isActive: true }).sort({ lastAuthAt: -1 });
};

// Static method to find or create app info
appInfoSchema.statics.findOrCreate = async function (appData) {
  const { appName, version, libraryToken, metadata = {} } = appData;

  // Try to find existing app info
  let appInfo = await this.findOne({
    appName,
    version,
    libraryToken,
    isActive: true,
  });

  if (appInfo) {
    // Update existing record
    appInfo.lastAuthAt = new Date();
    appInfo.authCount += 1;
    if (metadata.userAgent) appInfo.metadata.userAgent = metadata.userAgent;
    if (metadata.ipAddress) appInfo.metadata.ipAddress = metadata.ipAddress;
    if (metadata.platform) appInfo.metadata.platform = metadata.platform;
    await appInfo.save();
  } else {
    // Create new record
    appInfo = new this({
      appName,
      version,
      libraryToken,
      metadata,
    });
    await appInfo.save();
  }

  return appInfo;
};

// Instance method to record authentication
appInfoSchema.methods.recordAuth = function (metadata = {}) {
  this.lastAuthAt = new Date();
  this.authCount += 1;

  if (metadata.userAgent) this.metadata.userAgent = metadata.userAgent;
  if (metadata.ipAddress) this.metadata.ipAddress = metadata.ipAddress;
  if (metadata.platform) this.metadata.platform = metadata.platform;

  return this.save();
};

// Instance method to deactivate app info
appInfoSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Transform output when converting to JSON
appInfoSchema.methods.toJSON = function () {
  const appObj = this.toObject();

  // Transform _id to id
  appObj.id = appObj._id;
  delete appObj._id;
  delete appObj.__v;

  // Add computed fields
  appObj.appIdentifier = this.appIdentifier;

  return appObj;
};

// Static method to get app statistics
appInfoSchema.statics.getStatistics = async function (libraryToken = null) {
  const matchQuery = { isActive: true };
  if (libraryToken) {
    matchQuery.libraryToken = libraryToken;
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalApps: { $sum: 1 },
        uniqueAppNames: { $addToSet: "$appName" },
        uniqueVersions: { $addToSet: "$version" },
        totalAuthCount: { $sum: "$authCount" },
        avgAuthCount: { $avg: "$authCount" },
        lastAuthAt: { $max: "$lastAuthAt" },
        firstCreatedAt: { $min: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        totalApps: 1,
        uniqueAppNamesCount: { $size: "$uniqueAppNames" },
        uniqueVersionsCount: { $size: "$uniqueVersions" },
        totalAuthCount: 1,
        avgAuthCount: { $round: ["$avgAuthCount", 2] },
        lastAuthAt: 1,
        firstCreatedAt: 1,
      },
    },
  ]);

  return (
    stats[0] || {
      totalApps: 0,
      uniqueAppNamesCount: 0,
      uniqueVersionsCount: 0,
      totalAuthCount: 0,
      avgAuthCount: 0,
      lastAuthAt: null,
      firstCreatedAt: null,
    }
  );
};

// Pre-save middleware
appInfoSchema.pre("save", function (next) {
  // Normalize app name and version
  if (this.isModified("appName")) {
    this.appName = this.appName.trim();
  }

  if (this.isModified("version")) {
    this.version = this.version.trim();
  }

  if (this.isModified("libraryToken")) {
    this.libraryToken = this.libraryToken.toLowerCase();
  }

  next();
});

// Post-save middleware
appInfoSchema.post("save", function (doc, next) {
  console.log(
    `App info ${
      doc.appIdentifier
    } authenticated with token ${doc.libraryToken.substring(0, 8)}...`
  );
  next();
});

// Pre-remove middleware
appInfoSchema.pre(
  "deleteOne",
  { document: true, query: false },
  function (next) {
    console.log(`App info ${this.appIdentifier} is being deleted`);
    next();
  }
);

const AppInfo = mongoose.model("AppInfo", appInfoSchema);

module.exports = AppInfo;
