const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * NetworkInfo Schema for MongoDB
 * Stores mobile network information and connectivity details
 */
const networkInfoSchema = new Schema(
  {
    networkOperatorName: {
      type: String,
      trim: true,
      maxlength: [100, "Network operator name cannot exceed 100 characters"],
      default: null,
    },
    signalDbm: {
      type: Number,
      min: [-120, "Signal dBm cannot be less than -120"],
      max: [0, "Signal dBm cannot be greater than 0"],
      default: null,
    },
    subscriptionID: {
      type: String,
      trim: true,
      maxlength: [50, "Subscription ID cannot exceed 50 characters"],
      default: null,
    },
    networkType: {
      type: String,
      enum: {
        values: [
          "2G",
          "3G",
          "4G",
          "5G",
          "LTE",
          "EDGE",
          "GPRS",
          "HSPA",
          "HSPA+",
          "GSM",
          "CDMA",
          "WiFi",
          "Unknown",
        ],
        message: "{VALUE} is not a valid network type",
      },
      default: "Unknown",
    },
    networkQuality: {
      type: String,
      enum: {
        values: ["Poor", "Fair", "Good", "Excellent", "Unknown"],
        message: "{VALUE} is not a valid network quality",
      },
      default: "Unknown",
    },
    countryIso: {
      type: String,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2}$/, "Country ISO must be a 2-letter country code"],
      default: null,
    },
    isAirplaneModeOn: {
      type: Boolean,
      default: false,
    },
    isCellRegistered: {
      type: Boolean,
      default: false,
    },
    signalLevel: {
      type: Number,
      min: [0, "Signal level cannot be negative"],
      max: [5, "Signal level cannot exceed 5"],
      default: 0,
    },
    voiceCallSupport: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Voice call support description cannot exceed 100 characters",
      ],
      default: null,
    },
    callState: {
      type: String,
      enum: {
        values: ["Idle", "Ringing", "Offhook", "Unknown"],
        message: "{VALUE} is not a valid call state",
      },
      default: "Idle",
    },
    networkMNC: {
      type: String,
      trim: true,
      match: [/^\d{2,3}$/, "Network MNC must be 2-3 digits"],
      default: null,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    isRoaming: {
      type: Boolean,
      default: false,
    },
    networkMCC: {
      type: String,
      trim: true,
      match: [/^\d{3}$/, "Network MCC must be exactly 3 digits"],
      default: null,
    },
    connectionType: {
      type: String,
      enum: {
        values: ["Mobile", "WiFi", "Ethernet", "Bluetooth", "VPN", "Unknown"],
        message: "{VALUE} is not a valid connection type",
      },
      default: "Unknown",
    },
    signalAsu: {
      type: Number,
      min: [0, "Signal ASU cannot be negative"],
      max: [31, "Signal ASU cannot exceed 31"],
      default: null,
    },
    signalRssi: {
      type: Number,
      min: [-120, "Signal RSSI cannot be less than -120"],
      max: [0, "Signal RSSI cannot be greater than 0"],
      default: null,
    },
    networkOperatorCode: {
      type: String,
      trim: true,
      match: [/^\d{5,6}$/, "Network operator code must be 5-6 digits"],
      default: null,
    },

    // Additional metadata
    deviceInfo: {
      deviceId: {
        type: String,
        trim: true,
        default: null,
      },
      platform: {
        type: String,
        enum: ["Android", "iOS", "Windows", "Unknown"],
        default: "Unknown",
      },
    },

    // Location information (optional)
    location: {
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
        default: null,
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
        default: null,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Removes __v field
  }
);

// Create indexes for better query performance
networkInfoSchema.index({ createdAt: -1 });
networkInfoSchema.index({ "deviceInfo.deviceId": 1 });

networkInfoSchema.index({ networkType: 1 });
networkInfoSchema.index({ connectionType: 1 });
networkInfoSchema.index({ isConnected: 1 });

// Instance methods
networkInfoSchema.methods.toJSON = function () {
  const networkInfo = this.toObject();

  // Transform _id to id and remove _id
  networkInfo.id = networkInfo._id;
  delete networkInfo._id;

  return networkInfo;
};

// Static methods
networkInfoSchema.statics.findByDeviceId = function (deviceId) {
  return this.find({ "deviceInfo.deviceId": deviceId }).sort({ createdAt: -1 });
};

networkInfoSchema.statics.findByNetworkType = function (networkType) {
  return this.find({ networkType }).sort({ createdAt: -1 });
};

networkInfoSchema.statics.getNetworkStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        connectedDevices: {
          $sum: { $cond: [{ $eq: ["$isConnected", true] }, 1, 0] },
        },
        roamingDevices: {
          $sum: { $cond: [{ $eq: ["$isRoaming", true] }, 1, 0] },
        },
        averageSignalDbm: { $avg: "$signalDbm" },
        networkTypeDistribution: {
          $push: "$networkType",
        },
      },
    },
  ]);
};

// Pre-save middleware
networkInfoSchema.pre("save", function (next) {
  // Validate signal correlation
  if (this.signalDbm && this.signalRssi) {
    // Ensure signal values are consistent
    if (Math.abs(this.signalDbm - this.signalRssi) > 10) {
      console.warn("Signal dBm and RSSI values seem inconsistent");
    }
  }

  // Auto-set network quality based on signal strength
  if (this.signalDbm) {
    if (this.signalDbm >= -70) {
      this.networkQuality = "Excellent";
    } else if (this.signalDbm >= -85) {
      this.networkQuality = "Good";
    } else if (this.signalDbm >= -100) {
      this.networkQuality = "Fair";
    } else {
      this.networkQuality = "Poor";
    }
  }

  next();
});

// Create and export the model
const NetworkInfo = mongoose.model("NetworkInfo", networkInfoSchema);

module.exports = NetworkInfo;
