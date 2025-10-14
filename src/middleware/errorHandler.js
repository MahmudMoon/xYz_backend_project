const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = Date.now().toString();

  // Default error
  let error = {
    id: errorId,
    message: "Internal Server Error",
    status: 500,
    timestamp,
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error.message = "Validation Error";
    error.status = 400;
    error.details = err.details;
  } else if (err.name === "CastError") {
    error.message = "Invalid ID format";
    error.status = 400;
  } else if (err.status) {
    error.status = err.status;
    error.message = err.message;
  } else {
    error.message = err.message || "Internal Server Error";
  }

  // Log error to console
  console.error(`[${timestamp}] Error ${errorId}:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Log error to file
  const errorLog = {
    id: errorId,
    timestamp,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };

  const logFile = path.join(
    logsDir,
    `error-${new Date().toISOString().split("T")[0]}.log`
  );
  fs.appendFile(logFile, JSON.stringify(errorLog) + "\n", (writeErr) => {
    if (writeErr) console.error("Failed to write error to log file:", writeErr);
  });

  // Send error response
  res.status(error.status).json({
    success: false,
    error: {
      id: errorId,
      message: error.message,
      status: error.status,
      timestamp: error.timestamp,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
