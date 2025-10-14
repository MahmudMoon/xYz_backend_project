const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  // Log to console
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // Log to file
  const logEntry = `[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}\n`;
  const logFile = path.join(
    logsDir,
    `access-${new Date().toISOString().split("T")[0]}.log`
  );

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });

  next();
};

module.exports = logger;
