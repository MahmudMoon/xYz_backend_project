const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const AppInfo = require("../models/AppInfo");

/**
 * JWT Authentication middleware for admin routes
 * Verifies JWT token and adds admin information to request object
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Invalid token format. Use 'Bearer <token>'",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Empty token provided.",
        code: "EMPTY_TOKEN",
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, secret);

    // Check if token is for admin
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Invalid token type.",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    // Find admin in database
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Admin not found.",
        code: "ADMIN_NOT_FOUND",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Admin account is deactivated.",
        code: "ADMIN_DEACTIVATED",
      });
    }

    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        error:
          "Access denied. Admin account is locked due to too many failed login attempts.",
        code: "ADMIN_LOCKED",
        lockUntil: admin.lockUntil,
      });
    }

    // Add admin info to request object
    req.admin = admin;
    req.adminId = admin._id;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Access denied. Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Access denied. Token expired.",
        code: "TOKEN_EXPIRED",
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        error: "Access denied. Token not active yet.",
        code: "TOKEN_NOT_ACTIVE",
        notBefore: error.notBefore,
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: "Authentication failed due to server error.",
      code: "AUTH_SERVER_ERROR",
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, secret);

    if (decoded.type === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (admin && admin.isActive && !admin.isLocked) {
        req.admin = admin;
        req.adminId = admin._id;
        req.tokenPayload = decoded;
      }
    }

    next();
  } catch (error) {
    // Silently continue if optional auth fails
    next();
  }
};

/**
 * Rate limiting middleware for admin authentication
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of attempts.entries()) {
      if (value.timestamp < windowStart) {
        attempts.delete(key);
      }
    }

    // Check current attempts
    const currentAttempts = attempts.get(ip) || { count: 0, timestamp: now };

    if (
      currentAttempts.count >= maxAttempts &&
      currentAttempts.timestamp > windowStart
    ) {
      return res.status(429).json({
        success: false,
        error: "Too many authentication attempts. Please try again later.",
        code: "RATE_LIMITED",
        retryAfter: Math.ceil(
          (currentAttempts.timestamp + windowMs - now) / 1000
        ),
      });
    }

    // Update attempts for failed requests (will be called in auth failure)
    req.recordFailedAuth = () => {
      attempts.set(ip, {
        count: currentAttempts.count + 1,
        timestamp: now,
      });
    };

    next();
  };
};

/**
 * Device JWT Authentication middleware for device-protected routes
 * Verifies device JWT token generated from /device/auth endpoint
 */
const authenticateDevice = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No device token provided.",
        code: "NO_DEVICE_TOKEN",
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Invalid token format. Use 'Bearer <token>'",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Empty token provided.",
        code: "EMPTY_TOKEN",
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, secret);

    // Check if token is for device
    if (decoded.type !== "device") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Invalid token type. Expected device token.",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    // Verify app info exists and is valid
    const appInfo = await AppInfo.findById(decoded.appInfoId);

    if (!appInfo) {
      return res.status(401).json({
        success: false,
        error: "Access denied. App info not found.",
        code: "APP_INFO_NOT_FOUND",
      });
    }

    if (!appInfo.isActive) {
      return res.status(401).json({
        success: false,
        error: "Access denied. App has been deactivated.",
        code: "APP_DEACTIVATED",
      });
    }

    // Add device info to request object
    req.device = {
      appInfo: appInfo,
      appInfoId: decoded.appInfoId,
      appName: decoded.appName,
      version: decoded.version,
      libraryToken: decoded.libraryToken,
    };
    req.tokenPayload = decoded;

    // Record API usage for analytics
    await appInfo.recordAuth();

    next();
  } catch (error) {
    console.error("Device authentication error:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Access denied. Invalid device token.",
        code: "INVALID_DEVICE_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error:
          "Access denied. Device token has expired. Please re-authenticate.",
        code: "DEVICE_TOKEN_EXPIRED",
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        error: "Access denied. Device token not yet valid.",
        code: "DEVICE_TOKEN_NOT_ACTIVE",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "Internal server error during device authentication.",
      code: "DEVICE_AUTH_ERROR",
    });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateDevice,
  optionalAuth,
  authRateLimit,
};
