const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check and system monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic health status of the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
// GET /health - Basic health check
router.get("/", healthController.getHealth);

/**
 * @swagger
 * /health/system:
 *   get:
 *     summary: Detailed system information
 *     description: Returns detailed system and application information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       example: "darwin"
 *                     arch:
 *                       type: string
 *                       example: "x64"
 *                     nodeVersion:
 *                       type: string
 *                       example: "v18.18.0"
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *                     memory:
 *                       type: object
 *                     cpuUsage:
 *                       type: object
 *                     pid:
 *                       type: number
 *                       example: 12345
 *                 application:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Express Learning API"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "development"
 */
// GET /health/system - Detailed system information
router.get("/system", healthController.getSystemInfo);

module.exports = router;
