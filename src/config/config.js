const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,

  // MongoDB configuration
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/xYz_backend_db",

  // Database configuration (legacy - for other databases)
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 27017,
    NAME: process.env.DB_NAME || "xYz_backend_db",
  },

  // JWT configuration (for future use)
  JWT: {
    SECRET: process.env.JWT_SECRET || "your-secret-key",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  },

  // API configuration
  API: {
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
    },
  },
};

module.exports = config;
