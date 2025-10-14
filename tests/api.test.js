const request = require("supertest");
const app = require("../src/app");

describe("API Health Endpoints", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health").expect(200);

      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("timestamp");
      expect(res.body).toHaveProperty("uptime");
    });
  });

  describe("GET /health/system", () => {
    it("should return detailed system information", async () => {
      const res = await request(app).get("/health/system").expect(200);

      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("system");
      expect(res.body).toHaveProperty("application");
    });
  });
});

describe("API Error Handling", () => {
  describe("GET /nonexistent", () => {
    it("should return 404 for nonexistent routes", async () => {
      const res = await request(app).get("/nonexistent").expect(404);

      expect(res.body).toHaveProperty("error", "Route not found");
    });
  });
});
