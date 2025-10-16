const LibraryToken = require("../models/LibraryToken");
const AppInfo = require("../models/AppInfo");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/**
 * Device Service
 * Handles device authentication using library tokens and generates short-lived JWT tokens
 */
class DeviceService {
  /**
   * Authenticate device using library token and app info
   * @param {Object} authData - Authentication data
   * @returns {Object} - Success status, device JWT token, and app data
   */
  static async authenticateDevice(authData) {
    try {
      const { token, appInfo, metadata = {} } = authData;

      // Input validation
      if (!token) {
        throw new Error("Library token is required");
      }

      if (!appInfo || !appInfo.appName || !appInfo.version) {
        throw new Error("App name and version are required");
      }

      // Validate token format
      if (!/^[a-f0-9]{32}$/.test(token)) {
        throw new Error("Invalid token format");
      }

      // Find and validate library token
      const libraryToken = await LibraryToken.findByToken(token);

      if (!libraryToken) {
        throw new Error("Invalid library token");
      }

      if (!libraryToken.isActive) {
        throw new Error("Library token is deactivated");
      }

      if (libraryToken.isExpired) {
        throw new Error("Library token has expired");
      }

      // Record token usage
      await libraryToken.recordUsage();

      // Store or update app info
      const appInfoData = {
        appName: appInfo.appName.trim(),
        version: appInfo.version.trim(),
        libraryToken: token,
        metadata,
      };

      const savedAppInfo = await AppInfo.findOrCreate(appInfoData);

      // Generate short-lived device JWT token (5 minutes)
      const deviceToken = this.generateDeviceToken({
        appInfoId: savedAppInfo._id,
        appName: savedAppInfo.appName,
        version: savedAppInfo.version,
        libraryToken: token,
      });

      const refreshToken = this.generateRefreshToken({
        appInfoId: savedAppInfo._id,
        appName: savedAppInfo.appName,
        version: savedAppInfo.version,
        deviceToken,
      });

      return {
        success: true,
        message: "Device authenticated successfully",
        accessToken: deviceToken,
        refreshToken: refreshToken,
        expiresIn: "5m",
        appInfo: savedAppInfo.toJSON(),
        tokenInfo: {
          createdBy: libraryToken.createdBy.email,
          validity: libraryToken.validity,
          usageCount: libraryToken.usageCount,
        },
      };
    } catch (error) {
      console.error("Device authentication error:", error);
      throw error;
    }
  }

  /**
   * Generate short-lived JWT token for device
   * @param {Object} payload - Token payload
   * @returns {string} - JWT token
   */
  static generateDeviceToken(payload) {
    const tokenPayload = {
      ...payload,
      type: "device",
      iat: Math.floor(Date.now() / 1000),
    };

    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const options = {
      expiresIn: "5m", // 5 minutes
      issuer: "express_learning_api",
      audience: "device",
    };

    return jwt.sign(tokenPayload, secret, options);
  }

  static generateRefreshToken(payload) {
    const tokenPayload = {
      ...payload,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };

    const secret = process.env.JWT_REFRESH_SECRET || "fallback_secret_key";
    const options = {
      expiresIn: "7d", // 7 days
      issuer: "express_learning_api",
      audience: "device",
    };

    return jwt.sign(tokenPayload, secret, options);
  }

  /**
   * Verify device JWT token
   * @param {string} token - Device JWT token
   * @returns {Object} - Decoded token payload
   */
  static verifyDeviceToken(token) {
    try {
      const secret = process.env.JWT_SECRET || "fallback_secret_key";
      const decoded = jwt.verify(token, secret);

      if (decoded.type !== "device") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired device token");
    }
  }

  /**
   * Validate library token (utility method)
   * @param {string} token - Library token
   * @returns {Object} - Token validation result
   */
  static async validateLibraryToken(token) {
    try {
      if (!token) {
        throw new Error("Library token is required");
      }

      if (!/^[a-f0-9]{32}$/.test(token)) {
        throw new Error("Invalid token format");
      }

      const libraryToken = await LibraryToken.findByToken(token);

      if (!libraryToken) {
        return {
          valid: false,
          reason: "Token not found",
        };
      }

      if (!libraryToken.isActive) {
        return {
          valid: false,
          reason: "Token is deactivated",
        };
      }

      if (libraryToken.isExpired) {
        return {
          valid: false,
          reason: "Token has expired",
          expiredAt: libraryToken.validity,
        };
      }

      return {
        valid: true,
        token: {
          createdBy: libraryToken.createdBy.email,
          validity: libraryToken.validity,
          usageCount: libraryToken.usageCount,
          description: libraryToken.description,
        },
      };
    } catch (error) {
      console.error("Validate library token error:", error);
      return {
        valid: false,
        reason: error.message,
      };
    }
  }

  static async generateNewAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      const secret = process.env.JWT_REFRESH_SECRET || "fallback_secret_key";
      const decoded = jwt.verify(refreshToken, secret);

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Generate new short-lived device JWT token (5 minutes)
      const newDeviceToken = this.generateDeviceToken({
        appInfoId: decoded.appInfoId,
        appName: decoded.appName,
        version: decoded.version,
        libraryToken: decoded.libraryToken,
      });

      return {
        success: true,
        message: "New access token generated successfully",
        accessToken: newDeviceToken,
        expiresIn: "5m",
      };
    } catch (error) {
      console.error("Generate new access token error:", error);
      throw new Error("Invalid or expired refresh token");
    }
  }
}

module.exports = DeviceService;
