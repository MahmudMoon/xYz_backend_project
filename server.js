// Load environment variables from .env file
require("dotenv").config();

const app = require("./src/app");
const config = require("./src/config/config");
const database = require("./src/config/database");

const PORT = config.PORT || 3000;

// Initialize database connection
database.connect();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  console.log("⏳ Closing HTTP server...");

  // Stop accepting new connections and close existing ones
  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("✅ HTTP server closed successfully");
    console.log("🧹 Cleaning up resources...");

    // Close database connection
    database.disconnect();

    console.log("✅ Cleanup completed");
    console.log("👋 Process terminated gracefully");
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("⚠️  Graceful shutdown timeout. Forcing exit...");
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Process manager shutdown
process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Ctrl+C shutdown

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

module.exports = server;
