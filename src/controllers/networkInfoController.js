const networkInfoService = require("../services/networkInfoService");
const { validationResult } = require("express-validator");

class NetworkInfoController {
  // Get all network info records
  async getAllNetworkInfo(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        deviceId: req.query.deviceId,
        networkType: req.query.networkType,
        connectionType: req.query.connectionType,
        isConnected:
          req.query.isConnected !== undefined
            ? req.query.isConnected === "true"
            : undefined,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      };

      const result = await networkInfoService.getAllNetworkInfo(options);

      res.json({
        success: true,
        count: result.records.length,
        pagination: result.pagination,
        data: result.records,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get network info by ID
  async getNetworkInfoById(req, res, next) {
    try {
      const { id } = req.params;
      const networkInfo = await networkInfoService.getNetworkInfoById(id);

      if (!networkInfo) {
        return res.status(404).json({
          success: false,
          message: "Network information not found",
        });
      }

      res.json({
        success: true,
        data: networkInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new network info record
  async createNetworkInfo(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const networkInfo = await networkInfoService.createNetworkInfo(req.body);

      res.status(201).json({
        success: true,
        message: "Network information created successfully",
        data: networkInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update network info
  async updateNetworkInfo(req, res, next) {
    try {
      const { id } = req.params;

      const updatedNetworkInfo = await networkInfoService.updateNetworkInfo(
        id,
        req.body
      );

      if (!updatedNetworkInfo) {
        return res.status(404).json({
          success: false,
          message: "Network information not found",
        });
      }

      res.json({
        success: true,
        message: "Network information updated successfully",
        data: updatedNetworkInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete network info
  async deleteNetworkInfo(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await networkInfoService.deleteNetworkInfo(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Network information not found",
        });
      }

      res.json({
        success: true,
        message: "Network information deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get network info by device ID
  async getNetworkInfoByDeviceId(req, res, next) {
    try {
      const { deviceId } = req.params;
      const records = await networkInfoService.getNetworkInfoByDeviceId(
        deviceId
      );

      res.json({
        success: true,
        count: records.length,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk create network info records
  async bulkCreateNetworkInfo(req, res, next) {
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Records array is required and must not be empty",
        });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        try {
          const networkInfo = await networkInfoService.createNetworkInfo(
            records[i]
          );
          results.push(networkInfo);
        } catch (error) {
          errors.push({
            index: i,
            record: records[i],
            error: error.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: `Bulk creation completed. ${results.length} records created, ${errors.length} failed.`,
        created: results,
        failed: errors,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NetworkInfoController();
