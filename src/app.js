const express = require("express");
const path = require("path");
const cors = require("cors");

// Import database connection
const database = require("./config/database");

// Import routes
const healthRoutes = require("./routes/healthRoutes");
const networkInfoRoutes = require("./routes/networkInfoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const deviceRoutes = require("./routes/deviceRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

// Import Swagger configuration
const { swaggerUi, specs } = require("./config/swagger");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Custom middleware
app.use(logger);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Express Learning API Documentation",
  })
);

app.use("/health", healthRoutes);
app.use("/api/network-info", networkInfoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/device", deviceRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;
