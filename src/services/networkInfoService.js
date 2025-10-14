const NetworkInfo = require("../models/NetworkInfo");
const mongoose = require("mongoose");
const database = require("../config/database");

class NetworkInfoService {
  // Get all network info records
  async getAllNetworkInfo(options = {}) {
    try {
      if (!database.isConnected()) {
        console.log("⚠️  Database not connected, returning sample data");
        return this.getSampleNetworkInfo();
      }

      const {
        page = 1,
        limit = 10,
        deviceId,
        networkType,
        connectionType,
        isConnected,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Build query
      const query = {};
      if (deviceId) query["deviceInfo.deviceId"] = deviceId;
      if (networkType) query.networkType = networkType;
      if (connectionType) query.connectionType = connectionType;
      if (isConnected !== undefined) query.isConnected = isConnected;

      const [records, total] = await Promise.all([
        NetworkInfo.find(query).sort(sort).skip(skip).limit(limit),
        NetworkInfo.countDocuments(query),
      ]);

      return {
        records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching network info:", error.message);
      throw new Error("Failed to fetch network information");
    }
  }

  // Get network info by ID
  async getNetworkInfoById(id) {
    try {
      if (!database.isConnected()) {
        console.log("⚠️  Database not connected, returning sample data");
        const sampleData = this.getSampleNetworkInfo();
        return sampleData.find((item) => item.id.toString() === id.toString());
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid network info ID format");
      }

      const networkInfo = await NetworkInfo.findById(id);
      return networkInfo;
    } catch (error) {
      console.error("Error fetching network info by ID:", error.message);
      throw new Error("Failed to fetch network information");
    }
  }

  // Create new network info record
  async createNetworkInfo(networkData) {
    try {
      if (!database.isConnected()) {
        throw new Error(
          "Database not connected. Please check your MongoDB connection."
        );
      }

      const networkInfo = new NetworkInfo(networkData);
      const savedNetworkInfo = await networkInfo.save();
      return savedNetworkInfo;
    } catch (error) {
      console.error("Error creating network info:", error.message);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      throw error;
    }
  }

  // Update network info
  async updateNetworkInfo(id, networkData) {
    try {
      if (!database.isConnected()) {
        throw new Error(
          "Database not connected. Please check your MongoDB connection."
        );
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid network info ID format");
      }

      const networkInfo = await NetworkInfo.findByIdAndUpdate(id, networkData, {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      });

      return networkInfo;
    } catch (error) {
      console.error("Error updating network info:", error.message);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      throw error;
    }
  }

  // Delete network info
  async deleteNetworkInfo(id) {
    try {
      if (!database.isConnected()) {
        throw new Error(
          "Database not connected. Please check your MongoDB connection."
        );
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid network info ID format");
      }

      const networkInfo = await NetworkInfo.findByIdAndDelete(id);
      return !!networkInfo; // Return true if deleted, false if not found
    } catch (error) {
      console.error("Error deleting network info:", error.message);
      throw new Error("Failed to delete network information");
    }
  }

  // Get network info by device ID
  async getNetworkInfoByDeviceId(deviceId) {
    try {
      if (!database.isConnected()) {
        return this.getSampleNetworkInfo().filter(
          (item) => item.deviceInfo.deviceId === deviceId
        );
      }

      const records = await NetworkInfo.findByDeviceId(deviceId);
      return records;
    } catch (error) {
      console.error("Error fetching network info by device ID:", error.message);
      throw new Error("Failed to fetch network information by device ID");
    }
  }

  // Get network statistics
  async getNetworkStatistics() {
    try {
      if (!database.isConnected()) {
        return {
          totalRecords: 0,
          connectedDevices: 0,
          roamingDevices: 0,
          averageSignalDbm: null,
          networkTypeDistribution: {},
        };
      }

      const stats = await NetworkInfo.getNetworkStats();

      if (stats.length > 0) {
        const result = stats[0];

        // Calculate network type distribution
        const networkTypes = result.networkTypeDistribution || [];
        const distribution = {};
        networkTypes.forEach((type) => {
          distribution[type] = (distribution[type] || 0) + 1;
        });

        return {
          totalRecords: result.totalRecords || 0,
          connectedDevices: result.connectedDevices || 0,
          roamingDevices: result.roamingDevices || 0,
          averageSignalDbm: result.averageSignalDbm || null,
          networkTypeDistribution: distribution,
        };
      }

      return {
        totalRecords: 0,
        connectedDevices: 0,
        roamingDevices: 0,
        averageSignalDbm: null,
        networkTypeDistribution: {},
      };
    } catch (error) {
      console.error("Error getting network statistics:", error.message);
      throw new Error("Failed to get network statistics");
    }
  }

  // Get record count
  async getNetworkInfoCount() {
    try {
      if (!database.isConnected()) {
        return this.getSampleNetworkInfo().length;
      }

      const count = await NetworkInfo.countDocuments();
      return count;
    } catch (error) {
      console.error("Error getting network info count:", error.message);
      throw new Error("Failed to get network info count");
    }
  }

  // Sample data for when database is not connected
  getSampleNetworkInfo() {
    return [
      {
        id: "507f1f77bcf86cd799439021",
        networkOperatorName: "Verizon Wireless",
        signalDbm: -75,
        subscriptionID: "sub_12345",
        networkType: "5G",
        networkQuality: "Good",
        countryIso: "US",
        isAirplaneModeOn: false,
        isCellRegistered: true,
        signalLevel: 4,
        voiceCallSupport: true,
        callState: "IDLE",
        networkMNC: "001",
        isConnected: true,
        isRoaming: false,
        networkMCC: "310",
        connectionType: "Mobile",
        signalAsu: 15,
        signalRssi: -75,
        networkOperatorCode: "31001",
        deviceInfo: {
          deviceId: "device_001",
          platform: "Android",
        },
        createdAt: new Date("2023-10-14T10:00:00Z"),
        updatedAt: new Date("2023-10-14T10:00:00Z"),
      },
      {
        id: "507f1f77bcf86cd799439022",
        networkOperatorName: "AT&T",
        signalDbm: -85,
        subscriptionID: "sub_67890",
        networkType: "4G",
        networkQuality: "Fair",
        countryIso: "US",
        isAirplaneModeOn: false,
        isCellRegistered: true,
        signalLevel: 3,
        voiceCallSupport: true,
        callState: "IDLE",
        networkMNC: "410",
        isConnected: true,
        isRoaming: false,
        networkMCC: "310",
        connectionType: "Mobile",
        signalAsu: 10,
        signalRssi: -85,
        networkOperatorCode: "310410",
        deviceInfo: {
          deviceId: "device_002",
          platform: "iOS",
        },
        createdAt: new Date("2023-10-14T11:00:00Z"),
        updatedAt: new Date("2023-10-14T11:00:00Z"),
      },
    ];
  }
}

module.exports = new NetworkInfoService();
