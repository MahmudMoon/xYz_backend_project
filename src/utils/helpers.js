/**
 * Utility functions for common operations
 */

class ApiResponse {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message = "Error", status = 500, details = null) {
    return {
      success: false,
      message,
      status,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

class Utils {
  static sanitizeEmail(email) {
    return email.toLowerCase().trim();
  }

  static sanitizeName(name) {
    return name.trim().replace(/\s+/g, " ");
  }

  static generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static formatDate(date) {
    return new Date(date).toISOString();
  }

  static getCurrentTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = {
  ApiResponse,
  Utils,
};
