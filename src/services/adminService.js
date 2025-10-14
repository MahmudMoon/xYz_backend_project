const Admin = require("../models/Admin");
const LibraryToken = require("../models/LibraryToken");
const mongoose = require("mongoose");

/**
 * Admin Service
 * Handles all admin-related business logic and database operations
 */
class AdminService {
  /**
   * Verify admin credentials and return JWT token
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Object} - Success status, token, and admin data
   */
  static async verifyAdmin(email, password) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Find admin with password field included
      const admin = await Admin.findByEmailWithPassword(email);

      if (!admin) {
        throw new Error("Invalid email or password");
      }

      // Check if account is locked
      if (admin.isLocked) {
        const lockTimeRemaining = Math.ceil(
          (admin.lockUntil - Date.now()) / 1000 / 60
        );
        throw new Error(
          `Account is locked. Try again in ${lockTimeRemaining} minutes`
        );
      }

      // Check if account is active
      if (!admin.isActive) {
        throw new Error("Account is deactivated");
      }

      // Compare password
      const isPasswordValid = await admin.comparePassword(password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        await admin.incLoginAttempts();
        throw new Error("Invalid email or password");
      }

      // Reset login attempts on successful login
      await admin.resetLoginAttempts();

      // Generate JWT token
      const token = admin.generateAuthToken();

      // Return admin data without sensitive fields
      const adminData = admin.toJSON();

      return {
        success: true,
        message: "Admin verified successfully",
        token,
        admin: adminData,
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      };
    } catch (error) {
      console.error("Admin verification error:", error);
      throw error;
    }
  }

  /**
   * Get admin information by ID
   * @param {string} adminId - Admin ID
   * @returns {Object} - Admin data
   */
  static async getAdminInfo(adminId) {
    try {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error("Admin not found");
      }

      if (!admin.isActive) {
        throw new Error("Admin account is deactivated");
      }

      return {
        success: true,
        message: "Admin information retrieved successfully",
        admin: admin.toJSON(),
      };
    } catch (error) {
      console.error("Get admin info error:", error);
      throw error;
    }
  }

  /**
   * Update admin password
   * @param {string} adminId - Admin ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Success status and message
   */
  static async updateAdminPassword(adminId, currentPassword, newPassword) {
    try {
      if (!adminId || !currentPassword || !newPassword) {
        throw new Error(
          "Admin ID, current password, and new password are required"
        );
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long");
      }

      if (currentPassword === newPassword) {
        throw new Error("New password must be different from current password");
      }

      // Find admin with password field
      const admin = await Admin.findById(adminId).select("+password");

      if (!admin) {
        throw new Error("Admin not found");
      }

      if (!admin.isActive) {
        throw new Error("Admin account is deactivated");
      }

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Update password (will be hashed automatically by pre-save middleware)
      admin.password = newPassword;
      await admin.save();

      return {
        success: true,
        message: "Password updated successfully",
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Update admin password error:", error);
      throw error;
    }
  }

  /**
   * Delete admin account
   * @param {string} adminId - Admin ID
   * @param {string} password - Admin password for confirmation
   * @returns {Object} - Success status and message
   */
  static async deleteAdmin(adminId, password) {
    try {
      if (!adminId || !password) {
        throw new Error("Admin ID and password are required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      // Find admin with password field
      const admin = await Admin.findById(adminId).select("+password");

      if (!admin) {
        throw new Error("Admin not found");
      }

      // Verify password before deletion
      const isPasswordValid = await admin.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error("Password is incorrect");
      }

      // Delete the admin
      await Admin.deleteOne({ _id: adminId });

      return {
        success: true,
        message: "Admin account deleted successfully",
        deletedAt: new Date().toISOString(),
        deletedAdmin: {
          id: admin._id,
          email: admin.email,
        },
      };
    } catch (error) {
      console.error("Delete admin error:", error);
      throw error;
    }
  }

  /**
   * Create a new admin (utility method for seeding or admin creation)
   * @param {Object} adminData - Admin data
   * @returns {Object} - Created admin data
   */
  static async createAdmin(adminData) {
    try {
      const { email, password } = adminData;

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findByEmail(email);

      if (existingAdmin) {
        throw new Error("Admin with this email already exists");
      }

      // Create new admin
      const admin = new Admin({
        email: email.toLowerCase(),
        password,
      });

      await admin.save();

      return {
        success: true,
        message: "Admin created successfully",
        admin: admin.toJSON(),
      };
    } catch (error) {
      console.error("Create admin error:", error);
      throw error;
    }
  }

  /**
   * List all admins (for super admin functionality)
   * @param {Object} options - Query options
   * @returns {Object} - List of admins
   */
  static async getAllAdmins(options = {}) {
    try {
      const { page = 1, limit = 10, isActive } = options;

      const skip = (page - 1) * limit;
      const query = {};

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const [admins, total] = await Promise.all([
        Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Admin.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Admins retrieved successfully",
        data: admins,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      };
    } catch (error) {
      console.error("Get all admins error:", error);
      throw error;
    }
  }

  /**
   * Deactivate admin account (soft delete)
   * @param {string} adminId - Admin ID
   * @returns {Object} - Success status and message
   */
  static async deactivateAdmin(adminId) {
    try {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error("Admin not found");
      }

      if (!admin.isActive) {
        throw new Error("Admin is already deactivated");
      }

      admin.isActive = false;
      await admin.save();

      return {
        success: true,
        message: "Admin account deactivated successfully",
        admin: admin.toJSON(),
      };
    } catch (error) {
      console.error("Deactivate admin error:", error);
      throw error;
    }
  }

  /**
   * Reactivate admin account
   * @param {string} adminId - Admin ID
   * @returns {Object} - Success status and message
   */
  static async reactivateAdmin(adminId) {
    try {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        throw new Error("Admin not found");
      }

      if (admin.isActive) {
        throw new Error("Admin is already active");
      }

      admin.isActive = true;
      admin.loginAttempts = 0; // Reset login attempts
      admin.lockUntil = null; // Remove any locks
      await admin.save();

      return {
        success: true,
        message: "Admin account reactivated successfully",
        admin: admin.toJSON(),
      };
    } catch (error) {
      console.error("Reactivate admin error:", error);
      throw error;
    }
  }

  /**
   * Generate a unique 32-character library token
   * @param {string} adminId - Admin ID creating the token
   * @param {Object} tokenData - Token configuration
   * @returns {Object} - Generated token data
   */
  static async generateLibraryToken(adminId, tokenData = {}) {
    try {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      // Verify admin exists and is active
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      if (!admin.isActive) {
        throw new Error("Admin account is deactivated");
      }

      // Extract token configuration
      const { validityDays = 30, description = "" } = tokenData;

      // Validate validity days
      if (validityDays <= 0 || validityDays > 365) {
        throw new Error("Validity days must be between 1 and 365");
      }

      // Calculate validity date
      const validity = new Date();
      validity.setDate(validity.getDate() + validityDays);

      // Generate unique token
      const token = await LibraryToken.generateUniqueToken();

      // Create library token
      const libraryToken = new LibraryToken({
        token,
        createdBy: adminId,
        validity,
        description: description.trim(),
      });

      await libraryToken.save();

      // Populate the createdBy field for response
      await libraryToken.populate("createdBy", "email createdAt");

      return {
        success: true,
        message: "Library token generated successfully",
        token: libraryToken.toJSON(),
      };
    } catch (error) {
      console.error("Generate library token error:", error);
      throw error;
    }
  }

  /**
   * Get library tokens created by admin
   * @param {string} adminId - Admin ID
   * @param {Object} options - Query options
   * @returns {Object} - List of library tokens
   */
  static async getLibraryTokens(adminId, options = {}) {
    try {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const {
        page = 1,
        limit = 10,
        isActive,
        includeExpired = false,
      } = options;

      const skip = (page - 1) * limit;
      const query = { createdBy: adminId };

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (!includeExpired) {
        query.validity = { $gt: new Date() };
      }

      const [tokens, total] = await Promise.all([
        LibraryToken.find(query)
          .populate("createdBy", "email createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LibraryToken.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Library tokens retrieved successfully",
        data: tokens,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      };
    } catch (error) {
      console.error("Get library tokens error:", error);
      throw error;
    }
  }

  /**
   * Get all library tokens (admin overview)
   * @param {Object} options - Query options
   * @returns {Object} - List of all library tokens
   */
  static async getAllLibraryTokens(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        isActive,
        includeExpired = false,
        createdBy,
      } = options;

      const skip = (page - 1) * limit;
      const query = {};

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      if (!includeExpired) {
        query.validity = { $gt: new Date() };
      }

      if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
        query.createdBy = createdBy;
      }

      const [tokens, total] = await Promise.all([
        LibraryToken.find(query)
          .populate("createdBy", "email createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LibraryToken.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "All library tokens retrieved successfully",
        data: tokens,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      };
    } catch (error) {
      console.error("Get all library tokens error:", error);
      throw error;
    }
  }

  /**
   * Deactivate a library token
   * @param {string} tokenId - Library token ID
   * @param {string} adminId - Admin ID performing the action
   * @returns {Object} - Success status and message
   */
  static async deactivateLibraryToken(tokenId, adminId) {
    try {
      if (!tokenId || !adminId) {
        throw new Error("Token ID and Admin ID are required");
      }

      if (
        !mongoose.Types.ObjectId.isValid(tokenId) ||
        !mongoose.Types.ObjectId.isValid(adminId)
      ) {
        throw new Error("Invalid token ID or admin ID format");
      }

      // Find the token
      const token = await LibraryToken.findById(tokenId).populate(
        "createdBy",
        "email"
      );

      if (!token) {
        throw new Error("Library token not found");
      }

      // Check if admin is the creator or verify admin permissions
      if (token.createdBy._id.toString() !== adminId) {
        // For now, only the creator can deactivate.
        // You can modify this logic to allow other admins if needed
        throw new Error("Only the token creator can deactivate this token");
      }

      if (!token.isActive) {
        throw new Error("Token is already deactivated");
      }

      // Deactivate the token
      await token.deactivate();

      return {
        success: true,
        message: "Library token deactivated successfully",
        token: token.toJSON(),
      };
    } catch (error) {
      console.error("Deactivate library token error:", error);
      throw error;
    }
  }

  /**
   * Get library token statistics
   * @param {string} adminId - Admin ID (optional, for admin-specific stats)
   * @returns {Object} - Token statistics
   */
  static async getLibraryTokenStatistics(adminId = null) {
    try {
      let query = {};

      if (adminId) {
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
          throw new Error("Invalid admin ID format");
        }
        query.createdBy = adminId;
      }

      const stats = await LibraryToken.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalTokens: { $sum: 1 },
            activeTokens: {
              $sum: {
                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
              },
            },
            expiredTokens: {
              $sum: {
                $cond: [{ $lt: ["$validity", new Date()] }, 1, 0],
              },
            },
            validTokens: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$isActive", true] },
                      { $gt: ["$validity", new Date()] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalUsage: { $sum: "$usageCount" },
            avgUsage: { $avg: "$usageCount" },
          },
        },
      ]);

      const result = stats[0] || {
        totalTokens: 0,
        activeTokens: 0,
        expiredTokens: 0,
        validTokens: 0,
        totalUsage: 0,
        avgUsage: 0,
      };

      return {
        success: true,
        message: adminId
          ? "Admin library token statistics retrieved successfully"
          : "Library token statistics retrieved successfully",
        statistics: result,
      };
    } catch (error) {
      console.error("Get library token statistics error:", error);
      throw error;
    }
  }
}

module.exports = AdminService;
