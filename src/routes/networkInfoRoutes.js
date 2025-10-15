const express = require("express");
const router = express.Router();
const networkInfoController = require("../controllers/networkInfoController");
const {
  validateNetworkInfo,
  validateNetworkInfoId,
  validateDeviceId,
} = require("../middleware/validation");
const { authenticateDevice } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: NetworkInfo
 *   description: Network information management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NetworkInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "507f1f77bcf86cd799439021"
 *         networkOperatorName:
 *           type: string
 *           description: Name of the network operator
 *           example: "Verizon Wireless"
 *         signalDbm:
 *           type: number
 *           description: Signal strength in dBm
 *           example: -75
 *         subscriptionID:
 *           type: string
 *           description: Subscription identifier
 *           example: "sub_12345"
 *         networkType:
 *           type: string
 *           enum: [2G, 3G, 4G, 5G, LTE, EDGE, GPRS, HSPA, HSPA+, GSM, CDMA, WiFi, Unknown]
 *           example: "5G"
 *         networkQuality:
 *           type: string
 *           enum: [Poor, Fair, Good, Excellent, Unknown]
 *           example: "Good"
 *         countryIso:
 *           type: string
 *           description: Two-letter country code
 *           example: "US"
 *         isAirplaneModeOn:
 *           type: boolean
 *           example: false
 *         isCellRegistered:
 *           type: boolean
 *           example: true
 *         signalLevel:
 *           type: number
 *           description: Signal level (0-5)
 *           example: 4
 *         voiceCallSupport:
 *           type: string
 *           description: Voice call support description
 *           example: "Support (VoLTE)"
 *         callState:
 *           type: string
 *           enum: [Idle, Ringing, Offhook, Unknown]
 *           example: "Idle"
 *         networkMNC:
 *           type: string
 *           description: Mobile Network Code (2-3 digits)
 *           example: "001"
 *         isConnected:
 *           type: boolean
 *           example: true
 *         isRoaming:
 *           type: boolean
 *           example: false
 *         networkMCC:
 *           type: string
 *           description: Mobile Country Code (3 digits)
 *           example: "310"
 *         connectionType:
 *           type: string
 *           enum: [Mobile, WiFi, Ethernet, Bluetooth, VPN, Unknown]
 *           example: "Mobile"
 *         signalAsu:
 *           type: number
 *           description: Signal ASU (0-31)
 *           example: 15
 *         signalRssi:
 *           type: number
 *           description: Signal RSSI in dBm
 *           example: -75
 *         networkOperatorCode:
 *           type: string
 *           description: Network operator code (5-6 digits)
 *           example: "31001"
 *         deviceInfo:
 *           type: object
 *           properties:
 *             deviceId:
 *               type: string
 *               example: "device_001"
 *             platform:
 *               type: string
 *               enum: [Android, iOS, Windows, Unknown]
 *               example: "Android"
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               example: 40.7128
 *             longitude:
 *               type: number
 *               example: -74.0060
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-14T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-14T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/network-info:
 *   get:
 *     summary: Get all network info records
 *     description: Retrieve a paginated list of network information records
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *         description: Filter by device ID
 *       - in: query
 *         name: networkType
 *         schema:
 *           type: string
 *         description: Filter by network type
 *       - in: query
 *         name: connectionType
 *         schema:
 *           type: string
 *         description: Filter by connection type
 *       - in: query
 *         name: isConnected
 *         schema:
 *           type: boolean
 *         description: Filter by connection status
 *     responses:
 *       200:
 *         description: List of network info records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NetworkInfo'
 */
router.get("/", authenticateDevice, networkInfoController.getAllNetworkInfo);

/**
 * @swagger
 * /api/network-info/{id}:
 *   get:
 *     summary: Get network info by ID
 *     description: Retrieve a specific network info record by ID
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Network info ID
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439021"
 *     responses:
 *       200:
 *         description: Network info record found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NetworkInfo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  authenticateDevice,
  validateNetworkInfoId,
  networkInfoController.getNetworkInfoById
);

/**
 * @swagger
 * /api/network-info:
 *   post:
 *     summary: Create new network info record
 *     description: Create a new network information record
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NetworkInfo'
 *     responses:
 *       201:
 *         description: Network info created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network information created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NetworkInfo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/",
  authenticateDevice,
  validateNetworkInfo,
  networkInfoController.createNetworkInfo
);

/**
 * @swagger
 * /api/network-info/{id}:
 *   put:
 *     summary: Update network info
 *     description: Update an existing network info record
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Network info ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NetworkInfo'
 *     responses:
 *       200:
 *         description: Network info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network information updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NetworkInfo'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  "/:id",
  authenticateDevice,
  validateNetworkInfoId,
  validateNetworkInfo,
  networkInfoController.updateNetworkInfo
);

/**
 * @swagger
 * /api/network-info/{id}:
 *   delete:
 *     summary: Delete network info
 *     description: Delete a network info record by ID
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Network info ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Network info deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network information deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:id",
  authenticateDevice,
  validateNetworkInfoId,
  networkInfoController.deleteNetworkInfo
);

/**
 * @swagger
 * /api/network-info/device/{deviceId}:
 *   get:
 *     summary: Get network info by device ID
 *     description: Retrieve all network info records for a specific device
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         description: Device ID
 *         schema:
 *           type: string
 *           example: "device_001"
 *     responses:
 *       200:
 *         description: Network info records for device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NetworkInfo'
 */
router.get(
  "/device/:deviceId",
  authenticateDevice,
  validateDeviceId,
  networkInfoController.getNetworkInfoByDeviceId
);

/**
 * @swagger
 * /api/network-info/bulk:
 *   post:
 *     summary: Bulk create network info records
 *     description: Create multiple network info records in a single request
 *     tags: [NetworkInfo]
 *     security:
 *       - DeviceAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/NetworkInfo'
 *             required:
 *               - records
 *     responses:
 *       201:
 *         description: Bulk creation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bulk creation completed. 8 records created, 2 failed."
 *                 created:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NetworkInfo'
 *                 failed:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       index:
 *                         type: integer
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 */
router.post(
  "/bulk",
  authenticateDevice,
  networkInfoController.bulkCreateNetworkInfo
);

module.exports = router;
