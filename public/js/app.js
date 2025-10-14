// API Client for testing endpoints
class ApiClient {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("API Request failed:", error);
      return { status: 0, error: error.message };
    }
  }

  // Health endpoints
  async getHealth() {
    return this.request("/health");
  }

  async getSystemInfo() {
    return this.request("/health/system");
  }
}

// Initialize API client
const api = new ApiClient();

// DOM utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Status checker
async function checkApiStatus() {
  const statusElement = $("#api-status");
  try {
    const result = await api.getHealth();
    if (result.status === 200) {
      statusElement.className = "status online";
      statusElement.innerHTML = `
                <h3>✅ API Status: Online</h3>
                <p>Server is running normally</p>
                <p>Uptime: ${Math.floor(result.data.uptime)} seconds</p>
            `;
    } else {
      throw new Error("API not responding correctly");
    }
  } catch (error) {
    statusElement.className = "status offline";
    statusElement.innerHTML = `
            <h3>❌ API Status: Offline</h3>
            <p>Unable to connect to the server</p>
            <p>Error: ${error.message}</p>
        `;
  }
}

// Test endpoints
async function testEndpoints() {
  const results = $("#test-results");
  results.innerHTML = "<h3>Testing API Endpoints...</h3>";

  const tests = [
    { name: "Health Check", fn: () => api.getHealth() },
    { name: "System Info", fn: () => api.getSystemInfo() },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      const status = result.status === 200 ? "✅" : "❌";
      results.innerHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong>${status} ${test.name}</strong> - Status: ${
        result.status
      }
                    <br><small>Response: ${JSON.stringify(
                      result.data,
                      null,
                      2
                    )}</small>
                </div>
            `;
    } catch (error) {
      results.innerHTML += `
                <div style="margin: 10px 0; padding: 10px; background: #f8d7da; border-radius: 5px;">
                    <strong>❌ ${test.name}</strong> - Error: ${error.message}
                </div>
            `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  checkApiStatus();

  // Set up event listeners
  $("#refresh-status")?.addEventListener("click", checkApiStatus);
  $("#test-endpoints")?.addEventListener("click", testEndpoints);

  // Auto-refresh status every 30 seconds
  setInterval(checkApiStatus, 30000);
});
