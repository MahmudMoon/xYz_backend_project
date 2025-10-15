#!/usr/bin/env node

/**
 * CLI Script to Manage Super Admin
 *
 * This script provides various super admin management operations including:
 * - View super admin info
 * - Reset super admin password
 * - Check system status
 * - View admin statistics
 *
 * Usage:
 *   node scripts/manageSuperAdmin.js
 *   npm run manage-superadmin
 *
 * Features:
 * - Interactive menu system
 * - Secure password reset
 * - System information display
 * - Non-destructive operations
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
 */
function hideInput(query, callback) {
  rl.close();
  const hiddenRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

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
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    callback(password);
  });
  hiddenRl.stdoutMuted = true;
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters long");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter");
  if (!/\d/.test(password))
    errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("Password must contain at least one special character");

  return { isValid: errors.length === 0, errors: errors };
}

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function questionHidden(query) {
  return new Promise((resolve) => hideInput(query, resolve));
}

/**
 * Display banner
 */
function displayBanner() {
  console.log(chalk.blue("\n" + "=".repeat(60)));
  console.log(chalk.blue.bold("          SUPER ADMIN MANAGEMENT CONSOLE"));
  console.log(chalk.blue("=".repeat(60)));
  console.log(chalk.green("🛠️  Manage your super admin account safely"));
  console.log(chalk.blue("=".repeat(60) + "\n"));
}

/**
 * Display main menu
 */
function displayMenu() {
  console.log(chalk.cyan("\n📋 AVAILABLE OPERATIONS:"));
  console.log(chalk.white("1. 👤 View Super Admin Information"));
  console.log(chalk.white("2. 🔒 Reset Super Admin Password"));
  console.log(
    chalk.white("3. 🆘 Emergency Password Reset (when password unknown)")
  );
  console.log(chalk.white("4. 📊 View System Statistics"));
  console.log(chalk.white("5. 🔍 List All Admins"));
  console.log(chalk.white("6. ❌ Exit"));
  console.log();
}

/**
 * Find super admin
 */
async function findSuperAdmin() {
  const superAdmin = await Admin.findOne({ role: "superadmin" });
  return superAdmin;
}

/**
 * Find super admin with password (for authentication operations)
 */
async function findSuperAdminWithPassword() {
  const superAdmin = await Admin.findOne({ role: "superadmin" }).select(
    "+password"
  );
  return superAdmin;
}

/**
 * View super admin information
 */
async function viewSuperAdminInfo() {
  try {
    console.log(chalk.blue("\n🔍 Retrieving super admin information..."));
    const superAdmin = await findSuperAdmin();

    if (!superAdmin) {
      console.log(chalk.yellow("⚠️  No super admin found in the system"));
      console.log(
        chalk.cyan("💡 Use 'npm run create-superadmin' to create one")
      );
      return;
    }

    console.log(chalk.green("\n✅ Super Admin Information:"));
    console.log(chalk.white("─".repeat(40)));
    console.log(chalk.cyan(`📧 Email: ${superAdmin.email}`));
    console.log(chalk.cyan(`🔑 Role: ${superAdmin.role}`));
    console.log(
      chalk.cyan(`✅ Status: ${superAdmin.isActive ? "Active" : "Inactive"}`)
    );
    console.log(
      chalk.cyan(`📅 Created: ${superAdmin.createdAt?.toISOString() || "N/A"}`)
    );
    console.log(
      chalk.cyan(`🔄 Updated: ${superAdmin.updatedAt?.toISOString() || "N/A"}`)
    );
    console.log(chalk.white("─".repeat(40)));
  } catch (error) {
    console.log(
      chalk.red("❌ Error retrieving super admin info:"),
      error.message
    );
  }
}

/**
 * Reset super admin password
 */
async function resetSuperAdminPassword() {
  try {
    console.log(chalk.blue("\n🔒 Super Admin Password Reset"));
    const superAdmin = await findSuperAdminWithPassword();

    if (!superAdmin) {
      console.log(chalk.yellow("⚠️  No super admin found in the system"));
      return;
    }

    console.log(chalk.cyan(`📧 Super Admin: ${superAdmin.email}`));

    // Verify current password
    console.log(
      chalk.yellow("\n🔐 For security, please verify current password:")
    );
    const currentPassword = await questionHidden(
      chalk.cyan("🔒 Current password: ")
    );

    // Validate inputs before comparison
    if (!currentPassword) {
      console.log(chalk.red("❌ Password cannot be empty"));
      return;
    }

    if (!superAdmin.password) {
      console.log(chalk.red("❌ Super admin password not found in database"));
      console.log(
        chalk.yellow(
          "🔍 This might be a database issue. Please check the admin record."
        )
      );
      return;
    }

    console.log(chalk.blue("🔍 Verifying password..."));
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      superAdmin.password
    );

    if (!passwordMatch) {
      console.log(chalk.red("❌ Current password is incorrect"));
      return;
    }

    console.log(chalk.green("✅ Current password verified"));

    // Get new password
    let newPassword;
    while (true) {
      newPassword = await questionHidden(chalk.cyan("🔒 Enter new password: "));

      if (!newPassword) {
        console.log(chalk.red("❌ Password cannot be empty"));
        continue;
      }

      const validation = validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        console.log(
          chalk.red("❌ Password does not meet security requirements:")
        );
        validation.errors.forEach((error) =>
          console.log(chalk.red(`   • ${error}`))
        );
        continue;
      }

      const confirmPassword = await questionHidden(
        chalk.cyan("🔒 Confirm new password: ")
      );
      if (newPassword !== confirmPassword) {
        console.log(chalk.red("❌ Passwords do not match"));
        continue;
      }

      break;
    }

    // Confirm reset
    const confirm = await question(
      chalk.yellow("\n❓ Reset super admin password? (yes/no): ")
    );
    if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
      console.log(chalk.yellow("⚠️  Password reset cancelled"));
      return;
    }

    // Update password
    console.log(chalk.blue("🔄 Updating password..."));
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await Admin.findByIdAndUpdate(superAdmin._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    console.log(chalk.green("✅ Super admin password updated successfully!"));
    console.log(chalk.cyan(`🕒 Updated at: ${new Date().toISOString()}`));
  } catch (error) {
    console.log(chalk.red("❌ Error resetting password:"), error.message);
  }
}

/**
 * Emergency password reset (when current password is unknown)
 */
async function emergencyPasswordReset() {
  try {
    console.log(chalk.red("\n🆘 EMERGENCY PASSWORD RESET"));
    console.log(
      chalk.yellow("⚠️  Use this when you don't know the current password")
    );

    const superAdmin = await findSuperAdmin();
    if (!superAdmin) {
      console.log(chalk.yellow("⚠️  No super admin found in the system"));
      return;
    }

    console.log(chalk.cyan(`📧 Super Admin: ${superAdmin.email}`));

    // Confirmation
    const confirm = await question(
      chalk.red("\n❓ Proceed with emergency password reset? (yes/no): ")
    );

    if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
      console.log(chalk.green("✅ Emergency reset cancelled"));
      return;
    }

    // Get new password (visible for emergency)
    console.log(
      chalk.yellow(
        "\n🔒 Enter new password (will be visible for emergency reset):"
      )
    );
    let newPassword;
    while (true) {
      newPassword = await question(chalk.cyan("New password: "));

      if (!newPassword) {
        console.log(chalk.red("❌ Password cannot be empty"));
        continue;
      }

      const validation = validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        console.log(
          chalk.red("❌ Password does not meet security requirements:")
        );
        validation.errors.forEach((error) =>
          console.log(chalk.red(`   • ${error}`))
        );
        continue;
      }

      const confirmPassword = await question(chalk.cyan("Confirm password: "));
      if (newPassword !== confirmPassword) {
        console.log(chalk.red("❌ Passwords do not match"));
        continue;
      }

      break;
    }

    // Final confirmation
    const finalConfirm = await question(
      chalk.red("\n❓ Confirm emergency password reset? (yes/no): ")
    );

    if (
      finalConfirm.toLowerCase() !== "yes" &&
      finalConfirm.toLowerCase() !== "y"
    ) {
      console.log(chalk.green("✅ Emergency reset cancelled"));
      return;
    }

    // Update password directly
    console.log(chalk.blue("🔄 Updating password..."));
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await Admin.findByIdAndUpdate(superAdmin._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    console.log(chalk.green("✅ Emergency password reset successful!"));
    console.log(chalk.cyan(`🕒 Updated at: ${new Date().toISOString()}`));

    // Test the new password
    console.log(chalk.blue("🧪 Testing new password..."));
    const testAdmin = await findSuperAdminWithPassword();
    const isMatch = await bcrypt.compare(newPassword, testAdmin.password);

    if (isMatch) {
      console.log(chalk.green("✅ Password verification successful!"));
    } else {
      console.log(chalk.red("❌ Password verification failed"));
    }
  } catch (error) {
    console.log(chalk.red("❌ Error in emergency reset:"), error.message);
  }
}

/**
 * View system statistics
 */
async function viewSystemStatistics() {
  try {
    console.log(chalk.blue("\n📊 Retrieving system statistics..."));

    const [totalAdmins, activeAdmins, superAdmins, recentAdmins] =
      await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        Admin.countDocuments({ role: "superadmin" }),
        Admin.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("email role isActive createdAt"),
      ]);

    console.log(chalk.green("\n📈 SYSTEM STATISTICS"));
    console.log(chalk.white("─".repeat(50)));
    console.log(chalk.cyan(`👥 Total Admins: ${totalAdmins}`));
    console.log(chalk.cyan(`✅ Active Admins: ${activeAdmins}`));
    console.log(
      chalk.cyan(`❌ Inactive Admins: ${totalAdmins - activeAdmins}`)
    );
    console.log(chalk.cyan(`🔱 Super Admins: ${superAdmins}`));
    console.log(chalk.cyan(`👤 Regular Admins: ${totalAdmins - superAdmins}`));

    console.log(chalk.green("\n📝 RECENT ADMINS (Last 5):"));
    console.log(chalk.white("─".repeat(50)));

    if (recentAdmins.length === 0) {
      console.log(chalk.yellow("   No admins found"));
    } else {
      recentAdmins.forEach((admin, index) => {
        const status = admin.isActive ? chalk.green("●") : chalk.red("●");
        const role =
          admin.role === "superadmin"
            ? chalk.magenta("SUPER")
            : chalk.blue("ADMIN");
        console.log(
          `${index + 1}. ${status} ${admin.email} [${role}] - ${
            admin.createdAt?.toLocaleDateString() || "N/A"
          }`
        );
      });
    }
    console.log(chalk.white("─".repeat(50)));
  } catch (error) {
    console.log(chalk.red("❌ Error retrieving statistics:"), error.message);
  }
}

/**
 * List all admins
 */
async function listAllAdmins() {
  try {
    console.log(chalk.blue("\n👥 Retrieving all admin accounts..."));

    const admins = await Admin.find({})
      .sort({ role: -1, createdAt: -1 })
      .select("email role isActive createdAt");

    if (admins.length === 0) {
      console.log(chalk.yellow("⚠️  No admin accounts found in the system"));
      return;
    }

    console.log(
      chalk.green(`\n📋 ALL ADMIN ACCOUNTS (${admins.length} total):`)
    );
    console.log(chalk.white("─".repeat(80)));
    console.log(
      chalk.cyan("   Email                     Role      Status    Created")
    );
    console.log(chalk.white("─".repeat(80)));

    admins.forEach((admin, index) => {
      const status = admin.isActive
        ? chalk.green("Active  ")
        : chalk.red("Inactive");
      const role =
        admin.role === "superadmin"
          ? chalk.magenta("SUPER   ")
          : chalk.blue("ADMIN   ");
      const email = admin.email.padEnd(25);
      const created = admin.createdAt?.toLocaleDateString() || "N/A";

      console.log(
        `${(index + 1)
          .toString()
          .padStart(2)}. ${email} ${role} ${status} ${created}`
      );
    });

    console.log(chalk.white("─".repeat(80)));
  } catch (error) {
    console.log(chalk.red("❌ Error listing admins:"), error.message);
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

    while (true) {
      displayMenu();
      const choice = await question(
        chalk.yellow("❓ Select an option (1-6): ")
      );

      switch (choice.trim()) {
        case "1":
          await viewSuperAdminInfo();
          break;
        case "2":
          await resetSuperAdminPassword();
          break;
        case "3":
          await emergencyPasswordReset();
          break;
        case "4":
          await viewSystemStatistics();
          break;
        case "5":
          await listAllAdmins();
          break;
        case "6":
          console.log(chalk.green("👋 Goodbye!"));
          process.exit(0);
          break;
        default:
          console.log(chalk.red("❌ Invalid option. Please select 1-6."));
          break;
      }

      // Ask if user wants to continue
      const continueChoice = await question(
        chalk.cyan("\n❓ Continue with another operation? (yes/no): ")
      );
      if (
        continueChoice.toLowerCase() !== "yes" &&
        continueChoice.toLowerCase() !== "y"
      ) {
        console.log(chalk.green("👋 Session ended. Goodbye!"));
        break;
      }
    }
  } catch (error) {
    console.log(chalk.red("\n❌ ERROR:"), error.message);
    if (error.stack && process.env.NODE_ENV === "development") {
      console.log(chalk.gray("Stack trace:"), error.stack);
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

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("❌ Unhandled error:"), error.message);
    process.exit(1);
  });
}

module.exports = {
  main,
  findSuperAdmin,
  findSuperAdminWithPassword,
  viewSuperAdminInfo,
  resetSuperAdminPassword,
  viewSystemStatistics,
  listAllAdmins,
};
