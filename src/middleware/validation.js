const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Validation rules for network info creation/update
const validateNetworkInfo = [
  body("networkOperatorName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Network operator name cannot exceed 100 characters"),

  body("signalDbm")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < -120 || value > 0) {
        throw new Error("Signal dBm must be between -120 and 0");
      }
      return true;
    }),

  body("subscriptionID")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Subscription ID cannot exceed 50 characters"),

  body("networkType")
    .optional()
    .isIn([
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
    ])
    .withMessage("Invalid network type"),

  body("networkQuality")
    .optional()
    .isIn(["Poor", "Fair", "Good", "Excellent", "Unknown"])
    .withMessage("Invalid network quality"),

  body("countryIso")
    .optional()
    .isLength({ min: 2, max: 2 })
    .isAlpha()
    .toUpperCase()
    .withMessage("Country ISO must be a 2-letter country code"),

  body("isAirplaneModeOn")
    .optional()
    .isBoolean()
    .withMessage("isAirplaneModeOn must be a boolean"),

  body("isCellRegistered")
    .optional()
    .isBoolean()
    .withMessage("isCellRegistered must be a boolean"),

  body("signalLevel")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Signal level must be between 0 and 5"),

  body("voiceCallSupport")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Voice call support description cannot exceed 100 characters"),

  body("callState")
    .optional()
    .isIn(["Idle", "Ringing", "Offhook", "Unknown"])
    .withMessage("Invalid call state"),

  body("networkMNC")
    .optional()
    .matches(/^\d{2,3}$/)
    .withMessage("Network MNC must be 2-3 digits"),

  body("isConnected")
    .optional()
    .isBoolean()
    .withMessage("isConnected must be a boolean"),

  body("isRoaming")
    .optional()
    .isBoolean()
    .withMessage("isRoaming must be a boolean"),

  body("networkMCC")
    .optional()
    .matches(/^\d{3}$/)
    .withMessage("Network MCC must be exactly 3 digits"),

  body("connectionType")
    .optional()
    .isIn(["Mobile", "WiFi", "Ethernet", "Bluetooth", "VPN", "Unknown"])
    .withMessage("Invalid connection type"),

  body("signalAsu")
    .optional()
    .isInt({ min: 0, max: 31 })
    .withMessage("Signal ASU must be between 0 and 31"),

  body("signalRssi")
    .optional()
    .isNumeric()
    .custom((value) => {
      if (value < -120 || value > 0) {
        throw new Error("Signal RSSI must be between -120 and 0");
      }
      return true;
    }),

  body("networkOperatorCode")
    .optional()
    .matches(/^\d{5,6}$/)
    .withMessage("Network operator code must be 5-6 digits"),

  // Device info validation
  body("deviceInfo.deviceId")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Device ID must be between 1 and 100 characters"),

  body("deviceInfo.platform")
    .optional()
    .isIn(["Android", "iOS", "Windows", "Unknown"])
    .withMessage("Invalid platform"),

  // Location validation
  body("location.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("location.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

// Validation rules for NetworkInfo ID parameter
const validateNetworkInfoId = [
  param("id")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid network info ID format");
      }
      return true;
    })
    .withMessage("Network info ID must be a valid MongoDB ObjectId"),
];

// Validation for device ID parameter
const validateDeviceId = [
  param("deviceId")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Device ID must be between 1 and 100 characters"),
];

// Middleware to check validation results
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateNetworkInfo: [...validateNetworkInfo, checkValidationResult],
  validateNetworkInfoId: [...validateNetworkInfoId, checkValidationResult],
  validateDeviceId: [...validateDeviceId, checkValidationResult],
};
