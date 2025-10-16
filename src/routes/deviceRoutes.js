const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const { body, query, validationResult } = require("express-validator");

/**
 * Validation middleware to handle express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors.array(),
    });
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceAuthRequest:
 *       type: object
 *       required:
 *         - token
 *         - appInfo
 *       properties:
 *         token:
 *           type: string
 *           pattern: "^[a-f0-9]{32}$"
 *           example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
 *           description: "32-character library token"
 *         appInfo:
 *           type: object
 *           required:
 *             - appName
 *             - version
 *           properties:
 *             appName:
 *               type: string
 *               minLength: 2
 *               maxLength: 100
 *               example: "MyMobileApp"
 *               description: "Application name"
 *             version:
 *               type: string
 *               pattern: "^(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)(-[a-zA-Z0-9]+)?$"
 *               example: "1.2.3"
 *               description: "Application version (semantic versioning)"
 *         platform:
 *           type: string
 *           example: "Android"
 *           description: "Optional platform information"
 *     DeviceAuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Device authenticated successfully"
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: "Short-lived JWT token (5 minutes)"
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: "Long-lived JWT refresh token (7 days)"
 *         expiresIn:
 *           type: string
 *           example: "5m"
 *           description: "Token expiration time"
 *         appInfo:
 *           $ref: '#/components/schemas/AppInfo'
 *         tokenInfo:
 *           type: object
 *           properties:
 *             createdBy:
 *               type: string
 *               format: email
 *               example: "admin@example.com"
 *             validity:
 *               type: string
 *               format: date-time
 *               example: "2025-11-13T10:30:00.000Z"
 *             usageCount:
 *               type: number
 *               example: 15
 *     AppInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         appName:
 *           type: string
 *           example: "MyMobileApp"
 *         version:
 *           type: string
 *           example: "1.2.3"
 *         libraryToken:
 *           type: string
 *           example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
 *         lastAuthAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *         authCount:
 *           type: number
 *           example: 5
 *         isActive:
 *           type: boolean
 *           example: true
 *         appIdentifier:
 *           type: string
 *           example: "MyMobileApp@1.2.3"
 *         metadata:
 *           type: object
 *           properties:
 *             userAgent:
 *               type: string
 *               example: "MyApp/1.2.3 (Android 10)"
 *             ipAddress:
 *               type: string
 *               example: "192.168.1.100"
 *             platform:
 *               type: string
 *               example: "Android"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *     TokenValidationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Token is valid"
 *         valid:
 *           type: boolean
 *           example: true
 *         tokenInfo:
 *           type: object
 *           properties:
 *             createdBy:
 *               type: string
 *               format: email
 *               example: "admin@example.com"
 *             validity:
 *               type: string
 *               format: date-time
 *               example: "2025-11-13T10:30:00.000Z"
 *             usageCount:
 *               type: number
 *               example: 15
 *             description:
 *               type: string
 *               example: "Token for Q4 2025"
 */

/**
 * @swagger
 * /device/auth:
 *   post:
 *     tags:
 *       - Device Authentication
 *     summary: Authenticate device with library token
 *     description: Validate library token and app info, then return short-lived JWT token (5 minutes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceAuthRequest'
 *     responses:
 *       200:
 *         description: Device authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceAuthResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid, expired, or deactivated token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/auth",
  [
    body("token")
      .isString()
      .matches(/^[a-f0-9]{32}$/)
      .withMessage("Token must be a 32-character hexadecimal string"),
    body("appInfo.appName")
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("App name must be between 2 and 100 characters"),
    body("appInfo.version")
      .isString()
      .trim()
      .matches(/^(\d+\.)?(\d+\.)?(\*|\d+)(-[a-zA-Z0-9]+)?$/)
      .withMessage("Version must follow semantic versioning format"),
    body("platform")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Platform must be a string with maximum 50 characters"),
  ],
  handleValidationErrors,
  deviceController.authenticateDevice
);

/**
 * @swagger
 * /device/validate-token:
 *   get:
 *     tags:
 *       - Device Authentication
 *     summary: Validate library token
 *     description: Check if a library token is valid without authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-f0-9]{32}$"
 *         description: 32-character library token
 *         example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenValidationResponse'
 *       400:
 *         description: Bad request - missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token is invalid"
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 reason:
 *                   type: string
 *                   example: "Token has expired"
 */
router.get(
  "/validate-token",
  [
    query("token")
      .isString()
      .matches(/^[a-f0-9]{32}$/)
      .withMessage("Token must be a 32-character hexadecimal string"),
  ],
  handleValidationErrors,
  deviceController.validateToken
);

/**
 * @swagger
 * /device/refresh-token:
 *   post:
 *     tags:
 *       - Device Authentication
 *     summary: Refresh JWT token
 *     description: Refresh short-lived JWT token using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 description: "Valid JWT refresh token (7 days)"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: "New short-lived JWT token (5 minutes)"
 *                 expiresIn:
 *                   type: string
 *                   example: "5m"
 *                   description: "Token expiration time"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/refresh-token",
  [body("refreshToken").isString().withMessage("Refresh token is required")],
  handleValidationErrors,
  deviceController.refreshToken
);

module.exports = router;
