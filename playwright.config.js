module.exports = {
  testDir: "./tests",
  use: { baseURL: "http://localhost:8082" },
  webServer: {
    command: "node server.js",
    url: "http://localhost:8082",
    reuseExistingServer: true,
    timeout: 15000,
  },
};