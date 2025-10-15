const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
  authenticateSuperAdmin,
  canManageAdmins,
} = require("../middleware/auth");
const { body, param } = require("express-validator");

/**
 * Validation middleware to handle express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require("express-validator");
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
 *     SuperAdminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Super Admin JWT token required (role must be 'superadmin')
 *   schemas:
 *     AdminCreateRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "newadmin@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "SecurePassword123"
 *         confirmPassword:
 *           type: string
 *           example: "SecurePassword123"
 *     AdminResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         role:
 *           type: string
 *           enum: [admin, superadmin]
 *           example: "admin"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdBy:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "superadmin@example.com"
 *             role:
 *               type: string
 *               example: "superadmin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Super Admin
 *   description: Super admin management endpoints (requires super admin privileges)
 */

/**
 * @swagger
 * /api/superadmin/admins:
 *   get:
 *     summary: Get all regular admins
 *     description: Retrieve a paginated list of all regular admin accounts (super admin only)
 *     tags: [Super Admin]
 *     security:
 *       - SuperAdminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of admins per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email
 *     responses:
 *       200:
 *         description: Regular admins retrieved successfully
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
 *                   example: "Regular admins retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Super admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Access denied. Super admin privileges required."
 *                 code:
 *                   type: string
 *                   example: "SUPER_ADMIN_REQUIRED"
 */
router.get(
  "/admins",
  authenticateSuperAdmin,
  canManageAdmins,
  adminController.getAllRegularAdmins
);

/**
 * @swagger
 * /api/superadmin/admins:
 *   post:
 *     summary: Create new regular admin
 *     description: Create a new regular admin account (super admin only)
 *     tags: [Super Admin]
 *     security:
 *       - SuperAdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateRequest'
 *     responses:
 *       201:
 *         description: Admin created successfully
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
 *                   example: "Admin created successfully"
 *                 admin:
 *                   $ref: '#/components/schemas/AdminResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Super admin privileges required
 *       409:
 *         description: Admin with this email already exists
 */
router.post(
  "/admins",
  authenticateSuperAdmin,
  canManageAdmins,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password and confirmation password do not match");
      }
      return true;
    }),
  ],
  handleValidationErrors,
  adminController.createAdminBySuperAdmin
);

/**
 * @swagger
 * /api/superadmin/admins/{id}/revoke:
 *   put:
 *     summary: Revoke admin privileges
 *     description: Deactivate a regular admin account (super admin only)
 *     tags: [Super Admin]
 *     security:
 *       - SuperAdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID to revoke privileges
 *     responses:
 *       200:
 *         description: Admin privileges revoked successfully
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
 *                   example: "Admin privileges revoked successfully"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid admin ID or admin already deactivated
 *       403:
 *         description: Super admin privileges required or cannot revoke super admin
 *       404:
 *         description: Admin not found
 */
router.put(
  "/admins/:id/revoke",
  authenticateSuperAdmin,
  canManageAdmins,
  [param("id").isMongoId().withMessage("Valid admin ID is required")],
  handleValidationErrors,
  adminController.revokeAdminPrivileges
);

/**
 * @swagger
 * /api/superadmin/admins/{id}/restore:
 *   put:
 *     summary: Restore admin privileges
 *     description: Reactivate a regular admin account (super admin only)
 *     tags: [Super Admin]
 *     security:
 *       - SuperAdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID to restore privileges
 *     responses:
 *       200:
 *         description: Admin privileges restored successfully
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
 *                   example: "Admin privileges restored successfully"
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid admin ID or admin already active
 *       403:
 *         description: Super admin privileges required or cannot modify super admin
 *       404:
 *         description: Admin not found
 */
router.put(
  "/admins/:id/restore",
  authenticateSuperAdmin,
  canManageAdmins,
  [param("id").isMongoId().withMessage("Valid admin ID is required")],
  handleValidationErrors,
  adminController.restoreAdminPrivileges
);

/**
 * @swagger
 * /api/superadmin/admins/{id}:
 *   delete:
 *     summary: Delete admin permanently
 *     description: Permanently delete a regular admin account and all associated data (super admin only)
 *     tags: [Super Admin]
 *     security:
 *       - SuperAdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID to delete permanently
 *     responses:
 *       200:
 *         description: Admin deleted successfully
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
 *                   example: "Admin deleted successfully"
 *                 deletedAdmin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid admin ID
 *       403:
 *         description: Super admin privileges required or cannot delete super admin
 *       404:
 *         description: Admin not found
 */
router.delete(
  "/admins/:id",
  authenticateSuperAdmin,
  canManageAdmins,
  [param("id").isMongoId().withMessage("Valid admin ID is required")],
  handleValidationErrors,
  adminController.deleteAdminBySuperAdmin
);

module.exports = router;
