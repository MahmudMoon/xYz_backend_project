const AdminService = require("../services/adminService");

/**
 * Admin Controller
 * Handles HTTP requests for admin authentication and management
 */
class AdminController {
  /**
   * POST /api/admin/verify
   * Verify admin credentials and return JWT token
   */
  async verifyAdmin(req, res, next) {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
          code: "MISSING_CREDENTIALS",
        });
      }

      // Email format validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      // Password length validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
          code: "INVALID_PASSWORD_LENGTH",
        });
      }

      const result = await AdminService.verifyAdmin(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error("Verify admin error:", error);

      // Record failed auth attempt if rate limiting is enabled
      if (req.recordFailedAuth) {
        req.recordFailedAuth();
      }

      // Handle specific error messages
      if (error.message.includes("Invalid email or password")) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        });
      }

      if (error.message.includes("Account is locked")) {
        return res.status(423).json({
          success: false,
          error: error.message,
          code: "ACCOUNT_LOCKED",
        });
      }

      if (error.message.includes("Account is deactivated")) {
        return res.status(403).json({
          success: false,
          error: "Account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      next(error);
    }
  }

  /**
   * POST /api/superadmin/verify
   * Verify super admin credentials and return JWT token
   */
  async verifySuperAdmin(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AdminService.verifySuperAdmin(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error("Super admin verification error:", error);

      if (
        error.message.includes("Invalid email or password") ||
        error.message.includes("Invalid credentials")
      ) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        });
      }

      if (error.message.includes("Account is locked")) {
        return res.status(423).json({
          success: false,
          error: error.message,
          code: "ACCOUNT_LOCKED",
        });
      }

      if (error.message.includes("Account is deactivated")) {
        return res.status(403).json({
          success: false,
          error: "Super admin account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/admin/info
   * Get current logged-in admin information (requires JWT)
   */
  async getAdminInfo(req, res, next) {
    try {
      // Admin ID comes from JWT middleware
      const adminId = req.adminId;

      const result = await AdminService.getAdminInfo(adminId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get admin info error:", error);

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      if (error.message.includes("Admin account is deactivated")) {
        return res.status(403).json({
          success: false,
          error: "Admin account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      next(error);
    }
  }

  /**
   * PUT /api/admin/password
   * Update admin password (requires JWT)
   */
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const adminId = req.adminId;

      // Input validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error:
            "Current password, new password, and confirmation are required",
          code: "MISSING_PASSWORD_DATA",
        });
      }

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "New password and confirmation do not match",
          code: "PASSWORD_MISMATCH",
        });
      }

      // Password strength validation
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters long",
          code: "WEAK_PASSWORD",
        });
      }

      // Optional: Additional password strength checks
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error:
            "For better security, password should be at least 8 characters long",
          code: "WEAK_PASSWORD",
        });
      }

      const result = await AdminService.updateAdminPassword(
        adminId,
        currentPassword,
        newPassword
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Update password error:", error);

      if (error.message.includes("Current password is incorrect")) {
        return res.status(400).json({
          success: false,
          error: "Current password is incorrect",
          code: "INCORRECT_CURRENT_PASSWORD",
        });
      }

      if (error.message.includes("New password must be different")) {
        return res.status(400).json({
          success: false,
          error: "New password must be different from current password",
          code: "SAME_PASSWORD",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      next(error);
    }
  }

  /**
   * DELETE /api/admin/account
   * Delete admin account (requires JWT and password confirmation)
   */
  async deleteAdmin(req, res, next) {
    try {
      const { password, confirmation } = req.body;
      const adminId = req.adminId;

      // Input validation
      if (!password) {
        return res.status(400).json({
          success: false,
          error: "Password is required for account deletion",
          code: "MISSING_PASSWORD",
        });
      }

      if (!confirmation || confirmation !== "DELETE") {
        return res.status(400).json({
          success: false,
          error:
            "Please provide confirmation by sending 'DELETE' as confirmation field",
          code: "MISSING_CONFIRMATION",
        });
      }

      const result = await AdminService.deleteAdmin(adminId, password);

      res.status(200).json(result);
    } catch (error) {
      console.error("Delete admin error:", error);

      if (error.message.includes("Password is incorrect")) {
        return res.status(400).json({
          success: false,
          error: "Password is incorrect",
          code: "INCORRECT_PASSWORD",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/admin/list
   * List all admins (for super admin functionality)
   */
  async listAdmins(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
      };

      const result = await AdminService.getAllAdmins(options);

      res.status(200).json(result);
    } catch (error) {
      console.error("List admins error:", error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/:id/deactivate
   * Deactivate admin account (soft delete)
   */
  async deactivateAdmin(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Admin ID is required",
          code: "MISSING_ADMIN_ID",
        });
      }

      const result = await AdminService.deactivateAdmin(id);

      res.status(200).json(result);
    } catch (error) {
      console.error("Deactivate admin error:", error);

      if (error.message.includes("Invalid admin ID format")) {
        return res.status(400).json({
          success: false,
          error: "Invalid admin ID format",
          code: "INVALID_ADMIN_ID",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      next(error);
    }
  }

  /**
   * POST /api/admin/library-token
   * Generate a new 32-character library token (requires JWT)
   */
  async generateLibraryToken(req, res, next) {
    try {
      const { validityDays, description } = req.body;
      const adminId = req.adminId;

      // Input validation
      if (
        validityDays &&
        (typeof validityDays !== "number" ||
          validityDays <= 0 ||
          validityDays > 365)
      ) {
        return res.status(400).json({
          success: false,
          error: "Validity days must be a number between 1 and 365",
          code: "INVALID_VALIDITY_DAYS",
        });
      }

      if (description && typeof description !== "string") {
        return res.status(400).json({
          success: false,
          error: "Description must be a string",
          code: "INVALID_DESCRIPTION",
        });
      }

      const result = await AdminService.generateLibraryToken(adminId, {
        validityDays,
        description,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Generate library token error:", error);

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      if (error.message.includes("Admin account is deactivated")) {
        return res.status(403).json({
          success: false,
          error: "Admin account is deactivated",
          code: "ACCOUNT_DEACTIVATED",
        });
      }

      if (error.message.includes("Validity days")) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: "INVALID_VALIDITY_DAYS",
        });
      }

      if (error.message.includes("Failed to generate unique token")) {
        return res.status(500).json({
          success: false,
          error: "Failed to generate unique token. Please try again.",
          code: "TOKEN_GENERATION_FAILED",
        });
      }

      next(error);
    }
  }

  /**
   * GET /api/admin/library-tokens
   * Get library tokens created by the current admin (requires JWT)
   */
  async getLibraryTokens(req, res, next) {
    try {
      const adminId = req.adminId;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
        includeExpired: req.query.includeExpired === "true",
      };

      const result = await AdminService.getLibraryTokens(adminId, options);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get library tokens error:", error);
      next(error);
    }
  }

  /**
   * GET /api/admin/library-tokens/all
   * Get all library tokens (admin overview - requires JWT)
   */
  async getAllLibraryTokens(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
        includeExpired: req.query.includeExpired === "true",
        createdBy: req.query.createdBy,
      };

      const result = await AdminService.getAllLibraryTokens(options);

      res.status(200).json(result);
    } catch (error) {
      console.error("Get all library tokens error:", error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/library-token/:id/deactivate
   * Deactivate a library token (requires JWT)
   */
  async deactivateLibraryToken(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.adminId;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Token ID is required",
          code: "MISSING_TOKEN_ID",
        });
      }

      const result = await AdminService.deactivateLibraryToken(id, adminId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Deactivate library token error:", error);

      if (
        error.message.includes("Invalid token ID") ||
        error.message.includes("Invalid admin ID")
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid token ID or admin ID format",
          code: "INVALID_ID_FORMAT",
        });
      }

      if (error.message.includes("Library token not found")) {
        return res.status(404).json({
          success: false,
          error: "Library token not found",
          code: "TOKEN_NOT_FOUND",
        });
      }

      if (error.message.includes("Only the token creator")) {
        return res.status(403).json({
          success: false,
          error: "Only the token creator can deactivate this token",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      if (error.message.includes("Token is already deactivated")) {
        return res.status(400).json({
          success: false,
          error: "Token is already deactivated",
          code: "TOKEN_ALREADY_DEACTIVATED",
        });
      }

      next(error);
    }
  }

  // ===================================
  // SUPER ADMIN CONTROLLER METHODS
  // ===================================

  /**
   * GET /api/superadmin/admins
   * Get all regular admins (super admin only)
   */
  async getAllRegularAdmins(req, res, next) {
    try {
      const superAdminId = req.adminId;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
        search: req.query.search,
      };

      const result = await AdminService.getAllRegularAdmins(
        superAdminId,
        options
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Get all regular admins error:", error);

      if (error.message.includes("Valid super admin ID is required")) {
        return res.status(400).json({
          success: false,
          error: "Valid super admin ID is required",
          code: "INVALID_SUPER_ADMIN_ID",
        });
      }

      next(error);
    }
  }

  /**
   * POST /api/superadmin/admins
   * Create new regular admin (super admin only)
   */
  async createAdminBySuperAdmin(req, res, next) {
    try {
      const { email, password, confirmPassword } = req.body;
      const superAdminId = req.adminId;

      // Input validation
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: "Email, password, and password confirmation are required",
          code: "MISSING_ADMIN_DATA",
        });
      }

      // Email format validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      const result = await AdminService.createAdminBySuperAdmin(
        { email, password, confirmPassword },
        superAdminId
      );

      res.status(201).json(result);
    } catch (error) {
      console.error("Create admin by super admin error:", error);

      if (
        error.message.includes(
          "Password and confirmation password do not match"
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Password and confirmation password do not match",
          code: "PASSWORD_MISMATCH",
        });
      }

      if (error.message.includes("Password must be at least 6 characters")) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
          code: "WEAK_PASSWORD",
        });
      }

      if (error.message.includes("Admin with this email already exists")) {
        return res.status(409).json({
          success: false,
          error: "Admin with this email already exists",
          code: "ADMIN_EXISTS",
        });
      }

      next(error);
    }
  }

  /**
   * PUT /api/superadmin/admins/:id/revoke
   * Revoke admin privileges (super admin only)
   */
  async revokeAdminPrivileges(req, res, next) {
    try {
      const { id } = req.params;
      const superAdminId = req.adminId;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Admin ID is required",
          code: "MISSING_ADMIN_ID",
        });
      }

      const result = await AdminService.revokeAdminPrivileges(id, superAdminId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Revoke admin privileges error:", error);

      if (error.message.includes("Invalid admin ID")) {
        return res.status(400).json({
          success: false,
          error: "Invalid admin ID format",
          code: "INVALID_ADMIN_ID",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      if (error.message.includes("Cannot revoke super admin privileges")) {
        return res.status(403).json({
          success: false,
          error: "Cannot revoke super admin privileges",
          code: "CANNOT_REVOKE_SUPERADMIN",
        });
      }

      if (error.message.includes("Admin is already deactivated")) {
        return res.status(400).json({
          success: false,
          error: "Admin is already deactivated",
          code: "ADMIN_ALREADY_DEACTIVATED",
        });
      }

      next(error);
    }
  }

  /**
   * PUT /api/superadmin/admins/:id/restore
   * Restore admin privileges (super admin only)
   */
  async restoreAdminPrivileges(req, res, next) {
    try {
      const { id } = req.params;
      const superAdminId = req.adminId;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Admin ID is required",
          code: "MISSING_ADMIN_ID",
        });
      }

      const result = await AdminService.restoreAdminPrivileges(
        id,
        superAdminId
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Restore admin privileges error:", error);

      if (error.message.includes("Invalid admin ID")) {
        return res.status(400).json({
          success: false,
          error: "Invalid admin ID format",
          code: "INVALID_ADMIN_ID",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      if (error.message.includes("Super admin privileges cannot be modified")) {
        return res.status(403).json({
          success: false,
          error: "Super admin privileges cannot be modified",
          code: "CANNOT_MODIFY_SUPERADMIN",
        });
      }

      if (error.message.includes("Admin is already active")) {
        return res.status(400).json({
          success: false,
          error: "Admin is already active",
          code: "ADMIN_ALREADY_ACTIVE",
        });
      }

      next(error);
    }
  }

  /**
   * DELETE /api/superadmin/admins/:id
   * Permanently delete admin (super admin only)
   */
  async deleteAdminBySuperAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const superAdminId = req.adminId;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Admin ID is required",
          code: "MISSING_ADMIN_ID",
        });
      }

      const result = await AdminService.deleteAdminBySuperAdmin(
        id,
        superAdminId
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Delete admin by super admin error:", error);

      if (error.message.includes("Invalid admin ID")) {
        return res.status(400).json({
          success: false,
          error: "Invalid admin ID format",
          code: "INVALID_ADMIN_ID",
        });
      }

      if (error.message.includes("Admin not found")) {
        return res.status(404).json({
          success: false,
          error: "Admin not found",
          code: "ADMIN_NOT_FOUND",
        });
      }

      if (error.message.includes("Cannot delete super admin")) {
        return res.status(403).json({
          success: false,
          error: "Cannot delete super admin",
          code: "CANNOT_DELETE_SUPERADMIN",
        });
      }

      next(error);
    }
  }
}

module.exports = new AdminController();
