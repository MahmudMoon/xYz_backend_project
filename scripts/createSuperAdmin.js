#!/usr/bin/env node

/**
 * CLI Script to Create Super Admin
 *
 * This script provides a secure command-line interface to create the initial
 * super admin account. It includes password strength validation, confirmation
 * prompts, and proper error handling.
 *
 * Usage:
 *   node scripts/createSuperAdmin.js
 *   npm run create-superadmin
 *
 * Security Features:
 * - Password strength validation
 * - Confirmation prompt before creation
 * - Hidden password input
 * - Email validation
 * - Database connection cleanup
 * - Prevents duplicate super admin creation
 */

// Load environment variables from .env file
require("dotenv").config();

const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const chalk = require("chalk");
const validator = require("validator");

// Import configurations
const database = require("../src/config/database");
const Admin = require("../src/models/Admin");

// Create readline interface
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Hide password input using a simpler, more reliable approach
 * This avoids raw mode conflicts with readline interface
 */
function hideInput(query, callback) {
  // Temporarily close the existing readline interface to avoid conflicts
  rl.close();

  // Create a new readline interface specifically for hidden input
  const hiddenRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  // Override the _writeToOutput method to hide input
  hiddenRl._writeToOutput = function _writeToOutput(stringToWrite) {
    if (hiddenRl.stdoutMuted) {
      hiddenRl.output.write("*");
    } else {
      hiddenRl.output.write(stringToWrite);
    }
  };

  hiddenRl.stdoutMuted = false;
  hiddenRl.question(query, (password) => {
    hiddenRl.close();

    // Recreate the original readline interface
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    callback(password);
  });

  // Enable muting after question is displayed
  hiddenRl.stdoutMuted = true;
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Prompt for user input
 */
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

/**
 * Prompt for hidden password input
 */
function questionHidden(query) {
  return new Promise((resolve) => {
    hideInput(query, resolve);
  });
}

/**
 * Display banner
 */
function displayBanner() {
  console.log(chalk.blue("\n" + "=".repeat(60)));
  console.log(chalk.blue.bold("           SUPER ADMIN CREATION SCRIPT"));
  console.log(chalk.blue("=".repeat(60)));
  console.log(
    chalk.yellow("⚠️  This script creates the initial super admin account")
  );
  console.log(chalk.yellow("⚠️  Only ONE super admin can exist in the system"));
  console.log(chalk.blue("=".repeat(60) + "\n"));
}

/**
 * Check if super admin already exists
 */
async function checkExistingSuperAdmin() {
  try {
    const existingSuperAdmin = await Admin.findOne({ role: "superadmin" });
    return existingSuperAdmin !== null;
  } catch (error) {
    console.error(
      chalk.red("❌ Error checking existing super admin:"),
      error.message
    );
    throw error;
  }
}

/**
 * Create super admin account
 */
async function createSuperAdmin(email, password) {
  try {
    console.log(chalk.blue("\n📝 Creating super admin account..."));

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create super admin
    const superAdmin = new Admin({
      email: email,
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
    });

    await superAdmin.save();

    console.log(chalk.green("✅ Super admin created successfully!"));
    console.log(chalk.cyan(`📧 Email: ${email}`));
    console.log(chalk.cyan(`🔑 Role: superadmin`));
    console.log(chalk.cyan(`📅 Created: ${new Date().toISOString()}`));

    return superAdmin;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Admin with this email already exists");
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    displayBanner();

    // Connect to database
    console.log(chalk.blue("🔗 Connecting to database..."));
    await database.connect();
    console.log(chalk.green("✅ Database connected successfully"));

    // Check if super admin already exists
    console.log(chalk.blue("🔍 Checking for existing super admin..."));
    const superAdminExists = await checkExistingSuperAdmin();

    if (superAdminExists) {
      console.log(chalk.red("❌ ERROR: Super admin already exists!"));
      console.log(
        chalk.yellow("ℹ️  Only ONE super admin can exist in the system")
      );
      console.log(
        chalk.yellow("ℹ️  If you need to change super admin credentials,")
      );
      console.log(
        chalk.yellow("     please delete the existing super admin first")
      );
      process.exit(1);
    }

    console.log(chalk.green("✅ No existing super admin found"));

    // Get email
    let email;
    while (true) {
      email = await question(chalk.cyan("📧 Enter super admin email: "));

      if (!email.trim()) {
        console.log(chalk.red("❌ Email cannot be empty"));
        continue;
      }

      if (!validator.isEmail(email)) {
        console.log(chalk.red("❌ Please enter a valid email address"));
        continue;
      }

      // Check if email already exists
      const existingAdmin = await Admin.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingAdmin) {
        console.log(chalk.red("❌ An admin with this email already exists"));
        continue;
      }

      break;
    }

    // Get password
    let password;
    while (true) {
      password = await questionHidden(
        chalk.cyan("🔒 Enter super admin password: ")
      );

      if (!password) {
        console.log(chalk.red("❌ Password cannot be empty"));
        continue;
      }

      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        console.log(
          chalk.red("❌ Password does not meet security requirements:")
        );
        validation.errors.forEach((error) => {
          console.log(chalk.red(`   • ${error}`));
        });
        continue;
      }

      // Confirm password
      const confirmPassword = await questionHidden(
        chalk.cyan("🔒 Confirm password: ")
      );

      if (password !== confirmPassword) {
        console.log(chalk.red("❌ Passwords do not match"));
        continue;
      }

      break;
    }

    // Display summary and confirm
    console.log(chalk.yellow("\n📋 SUPER ADMIN DETAILS:"));
    console.log(chalk.white(`   Email: ${email}`));
    console.log(chalk.white(`   Role: superadmin`));
    console.log(chalk.white(`   Status: Active`));

    const confirm = await question(
      chalk.yellow("\n❓ Create super admin with above details? (yes/no): ")
    );

    if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
      console.log(chalk.yellow("⚠️  Super admin creation cancelled"));
      process.exit(0);
    }

    // Create super admin
    await createSuperAdmin(email, password);

    console.log(chalk.green("\n🎉 Super admin setup completed successfully!"));
    console.log(
      chalk.blue("📚 You can now use the super admin credentials to:")
    );
    console.log(chalk.white("   • Create and manage regular admins"));
    console.log(chalk.white("   • Revoke and restore admin privileges"));
    console.log(chalk.white("   • Delete admin accounts"));
    console.log(chalk.white("   • View comprehensive system statistics"));
    console.log(chalk.blue("\n🌐 Access the API documentation at: /api-docs"));
  } catch (error) {
    console.log(chalk.red("\n❌ ERROR: Failed to create super admin"));
    console.log(chalk.red(`   ${error.message}`));

    if (error.stack && process.env.NODE_ENV === "development") {
      console.log(chalk.gray("\nStack trace:"));
      console.log(chalk.gray(error.stack));
    }

    process.exit(1);
  } finally {
    // Cleanup
    rl.close();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log(chalk.blue("\n🔌 Database connection closed"));
    }
  }
}

// Handle process signals
process.on("SIGINT", async () => {
  console.log(chalk.yellow("\n⚠️  Process interrupted by user"));
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log(chalk.yellow("\n⚠️  Process terminated"));
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("❌ Unhandled error:"), error.message);
    process.exit(1);
  });
}

module.exports = {
  main,
  createSuperAdmin,
  validatePasswordStrength,
  checkExistingSuperAdmin,
};
