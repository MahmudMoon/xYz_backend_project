const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express Learning API",
      version: "1.0.0",
      description:
        "A well-structured Express.js API with proper folder organization",
      contact: {
        name: "Mustofa Mahmud",
        email: "your-email@example.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token for admin authentication",
        },
        SuperAdminAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter JWT token for super admin authentication (role must be 'superadmin')",
        },
        DeviceAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter device JWT token obtained from /device/auth endpoint (5-minute validity)",
        },
      },
      schemas: {
        HealthCheck: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "OK",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2023-10-14T10:30:00.000Z",
            },
            uptime: {
              type: "number",
              description: "Server uptime in seconds",
              example: 3600,
            },
            memory: {
              type: "object",
              description: "Memory usage information",
            },
            environment: {
              type: "string",
              example: "development",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: {
              type: "object",
              description: "Response data",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2023-10-14T10:30:00.000Z",
            },
          },
        },
        LibraryToken: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
              description: "Unique identifier for the library token",
            },
            token: {
              type: "string",
              example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
              description: "32-character unique hash string",
              minLength: 32,
              maxLength: 32,
            },
            createdBy: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "507f1f77bcf86cd799439011",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "admin@example.com",
                },
                createdAt: {
                  type: "string",
                  format: "date-time",
                  example: "2025-10-14T10:30:00.000Z",
                },
              },
            },
            validity: {
              type: "string",
              format: "date-time",
              example: "2025-11-13T10:30:00.000Z",
              description: "Token expiry date",
            },
            isActive: {
              type: "boolean",
              example: true,
              description: "Whether the token is active",
            },
            isExpired: {
              type: "boolean",
              example: false,
              description: "Whether the token has expired",
            },
            isValid: {
              type: "boolean",
              example: true,
              description: "Whether the token is active and not expired",
            },
            description: {
              type: "string",
              example: "Token for Q4 2025 library access",
              description: "Optional description for the token",
            },
            usageCount: {
              type: "number",
              example: 5,
              description: "Number of times token has been used",
            },
            lastUsed: {
              type: "string",
              format: "date-time",
              example: "2025-10-14T10:30:00.000Z",
              description: "When the token was last used",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-10-14T10:30:00.000Z",
              description: "Token creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-10-14T10:30:00.000Z",
              description: "Token last update timestamp",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "number",
              example: 1,
              description: "Current page number",
            },
            limit: {
              type: "number",
              example: 10,
              description: "Number of items per page",
            },
            total: {
              type: "number",
              example: 50,
              description: "Total number of items",
            },
            pages: {
              type: "number",
              example: 5,
              description: "Total number of pages",
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Something went wrong",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
              example: "2023-10-14T10:30:00.000Z",
            },
            path: {
              type: "string",
              description: "Request path that caused the error",
              example: "/api/network-info",
            },
            method: {
              type: "string",
              description: "HTTP method used",
              example: "POST",
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.js", // Path to the API files
    "./src/controllers/*.js", // Path to controller files
    "./src/app.js", // Main app file
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
