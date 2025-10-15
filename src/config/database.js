require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config/config");

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // MongoDB connection options
      const options = {
        // Modern connection options
        // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
      };

      console.log("🔌 Connecting to MongoDB...");
      this.connection = await mongoose.connect(config.MONGODB_URI, options);

      console.log(`✅ MongoDB connected successfully!`);
      console.log(`📊 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}`);
      console.log(`🔢 Port: ${this.connection.connection.port}`);

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
      });
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);

      // In development, we can continue without database
      if (config.NODE_ENV === "development") {
        console.log(
          "⚠️  Running in development mode without database connection"
        );
        console.log(
          "💡 Make sure MongoDB is running: mongod --dbpath /path/to/db"
        );
      } else {
        // In production, exit the process
        process.exit(1);
      }
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
      }
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error.message);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getConnectionStatus() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState] || "unknown";
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
