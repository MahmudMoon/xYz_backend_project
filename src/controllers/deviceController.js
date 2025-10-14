const DeviceService = require("../services/deviceService");

/**
 * Device Controller
 * Handles HTTP requests for device authentication using library tokens
 */
class DeviceController {
  /**
   * POST /device/auth
   * Authenticate device using library token and app info (no authentication required)
   */
  async authenticateDevice(req, res, next) {
    try {
      const { token, appInfo } = req.body;

      // Input validation
      if (!token) {
        return res.status(400).json({
          success: false,
          error: "Library token is required",
          code: "MISSING_TOKEN",
        });
      }

      if (!appInfo) {
        return res.status(400).json({
          success: false,
          error: "App info is required",
          code: "MISSING_APP_INFO",
        });
      }

      if (!appInfo.appName || !appInfo.version) {
        return res.status(400).json({
          success: false,
          error: "App name and version are required",
          code: "MISSING_APP_DETAILS",
        });
      }

      // Token format validation
      if (typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid token format. Token must be a 32-character hexadecimal string",
          code: "INVALID_TOKEN_FORMAT",
        });
      }

      // App name validation
      if (
        typeof appInfo.appName !== "string" ||
        appInfo.appName.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          error: "App name must be a string with at least 2 characters",
          code: "INVALID_APP_NAME",
        });
      }

      // Version validation (semantic versioning)
      const versionRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)(-[a-zA-Z0-9]+)?$/;
      if (
        typeof appInfo.version !== "string" ||
        !versionRegex.test(appInfo.version.trim())
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Version must follow semantic versioning format (e.g., 1.0.0, 2.1.3-beta)",
          code: "INVALID_VERSION_FORMAT",
        });
      }

      // Extract metadata from request
      const metadata = {
        userAgent: req.get("User-Agent") || null,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        platform: req.body.platform || null,
      };

      const authData = {
        token: token.toLowerCase(), // Normalize to lowercase
        appInfo: {
          appName: appInfo.appName.trim(),
          version: appInfo.version.trim(),
        },
        metadata,
      };

      const result = await DeviceService.authenticateDevice(authData);

      res.status(200).json(result);
    } catch (error) {
      console.error("Device authentication error:", error);

      // Handle specific error messages
      if (error.message.includes("Library token is required")) {
        return res.status(400).json({
          success: false,
          error: "Library token is required",
          code: "MISSING_TOKEN",
        });
      }

      if (error.message.includes("App name and version are required")) {
        return res.status(400).json({
          success: false,
          error: "App name and version are required",
          code: "MISSING_APP_DETAILS",
        });
      }

      if (error.message.includes("Invalid token format")) {
        return res.status(400).json({
          success: false,
          error: "Invalid token format",
          code: "INVALID_TOKEN_FORMAT",
        });
      }

      if (error.message.includes("Invalid library token")) {
        return res.status(401).json({
          success: false,
          error: "Invalid library token",
          code: "INVALID_TOKEN",
        });
      }

      if (error.message.includes("Library token is deactivated")) {
        return res.status(401).json({
          success: false,
          error: "Library token is deactivated",
          code: "TOKEN_DEACTIVATED",
        });
      }

      if (error.message.includes("Library token has expired")) {
        return res.status(401).json({
          success: false,
          error: "Library token has expired",
          code: "TOKEN_EXPIRED",
        });
      }

      next(error);
    }
  }

  /**
   * GET /device/validate-token
   * Validate library token without authentication (utility endpoint)
   */
  async validateToken(req, res, next) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: "Library token is required as query parameter",
          code: "MISSING_TOKEN",
        });
      }

      const result = await DeviceService.validateLibraryToken(token);

      if (result.valid) {
        res.status(200).json({
          success: true,
          message: "Token is valid",
          valid: true,
          tokenInfo: result.token,
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Token is invalid",
          valid: false,
          reason: result.reason,
          expiredAt: result.expiredAt || undefined,
        });
      }
    } catch (error) {
      console.error("Token validation error:", error);
      next(error);
    }
  }
}

module.exports = new DeviceController();
