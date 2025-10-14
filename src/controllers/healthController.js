const database = require("../config/database");

class HealthController {
  // Basic health check
  getHealth(req, res) {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: database.isConnected(),
        status: database.getConnectionStatus(),
      },
    });
  }

  // Detailed system info
  getSystemInfo(req, res) {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
      },
      database: {
        connected: database.isConnected(),
        status: database.getConnectionStatus(),
        type: "MongoDB",
      },
      application: {
        name: "Express Learning API",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
    });
  }
}

module.exports = new HealthController();
