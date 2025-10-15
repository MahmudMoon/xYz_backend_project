const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin, authRateLimit } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

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
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdminVerifyRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "adminpassword123"
 *     AdminVerifyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Admin verified successfully"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         admin:
 *           $ref: '#/components/schemas/Admin'
 *         expiresIn:
 *           type: string
 *           example: "24h"
 *     Admin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-14T10:30:00.000Z"
 *     UpdatePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           minLength: 6
 *           example: "currentpassword123"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: "newpassword456"
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           example: "newpassword456"
 *     DeleteAdminRequest:
 *       type: object
 *       required:
 *         - password
 *         - confirmation
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "adminpassword123"
 *         confirmation:
 *           type: string
 *           enum: ["DELETE"]
 *           example: "DELETE"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Error message"
 *         code:
 *           type: string
 *           example: "ERROR_CODE"
 */

/**
 * @swagger
 * /api/admin/verify:
 *   post:
 *     tags:
 *       - Admin Authentication
 *     summary: Verify regular admin credentials
 *     description: Authenticate regular admin with email and password, returns JWT token (regular admins only, super admins use /api/superadmin/verify)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVerifyRequest'
 *     responses:
 *       200:
 *         description: Admin verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVerifyResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       423:
 *         description: Account locked due to too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/verify",
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  handleValidationErrors,
  adminController.verifyAdmin
);

/**
 * @swagger
 * /api/admin/info:
 *   get:
 *     tags:
 *       - Admin Management
 *     summary: Get current admin information
 *     description: Retrieve information about the currently logged-in admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admin information retrieved successfully
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
 *                   example: "Admin information retrieved successfully"
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/info", authenticateAdmin, adminController.getAdminInfo);

/**
 * @swagger
 * /api/admin/password:
 *   put:
 *     tags:
 *       - Admin Management
 *     summary: Update admin password
 *     description: Update the password for the currently logged-in admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: "Password updated successfully"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/password",
  authenticateAdmin,
  [
    body("currentPassword")
      .isLength({ min: 6 })
      .withMessage("Current password must be at least 6 characters long"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  ],
  handleValidationErrors,
  adminController.updatePassword
);

/**
 * @swagger
 * /api/admin/account:
 *   delete:
 *     tags:
 *       - Admin Management
 *     summary: Delete admin account
 *     description: Permanently delete the currently logged-in admin account
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAdminRequest'
 *     responses:
 *       200:
 *         description: Admin account deleted successfully
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
 *                   example: "Admin account deleted successfully"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                 deletedAdmin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request - validation error or incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/account",
  authenticateAdmin,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmation")
      .equals("DELETE")
      .withMessage("Confirmation must be 'DELETE'"),
  ],
  handleValidationErrors,
  adminController.deleteAdmin
);

/**
 * @swagger
 * /api/admin/library-token:
 *   post:
 *     tags:
 *       - Library Token Management
 *     summary: Generate new library token
 *     description: Generate a unique 32-character hash token for library access
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               validityDays:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 30
 *                 example: 30
 *                 description: "Number of days the token will be valid"
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Token for Q4 2025 library access"
 *                 description: "Optional description for the token"
 *     responses:
 *       201:
 *         description: Library token generated successfully
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
 *                   example: "Library token generated successfully"
 *                 token:
 *                   $ref: '#/components/schemas/LibraryToken'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/library-token",
  authenticateAdmin,
  [
    body("validityDays")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("Validity days must be between 1 and 365"),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Description must be a string with maximum 255 characters"),
  ],
  handleValidationErrors,
  adminController.generateLibraryToken
);

/**
 * @swagger
 * /api/admin/library-tokens:
 *   get:
 *     tags:
 *       - Library Token Management
 *     summary: Get library tokens created by current admin
 *     description: Retrieve library tokens created by the currently logged-in admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of tokens per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: includeExpired
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include expired tokens
 *     responses:
 *       200:
 *         description: Library tokens retrieved successfully
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
 *                   example: "Library tokens retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LibraryToken'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/library-tokens",
  authenticateAdmin,
  adminController.getLibraryTokens
);

/**
 * @swagger
 * /api/admin/library-tokens/all:
 *   get:
 *     tags:
 *       - Library Token Management
 *     summary: Get all library tokens (admin overview)
 *     description: Retrieve all library tokens in the system
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of tokens per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: includeExpired
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include expired tokens
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator admin ID
 *     responses:
 *       200:
 *         description: All library tokens retrieved successfully
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
 *                   example: "All library tokens retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LibraryToken'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/library-tokens/all",
  authenticateAdmin,
  adminController.getAllLibraryTokens
);

/**
 * @swagger
 * /api/admin/library-token/{id}/deactivate:
 *   put:
 *     tags:
 *       - Library Token Management
 *     summary: Deactivate library token
 *     description: Deactivate a library token (only creator can deactivate)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Library token ID
 *     responses:
 *       200:
 *         description: Library token deactivated successfully
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
 *                   example: "Library token deactivated successfully"
 *                 token:
 *                   $ref: '#/components/schemas/LibraryToken'
 *       400:
 *         description: Bad request - invalid ID or token already deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Library token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/library-token/:id/deactivate",
  authenticateAdmin,
  adminController.deactivateLibraryToken
);

module.exports = router;
