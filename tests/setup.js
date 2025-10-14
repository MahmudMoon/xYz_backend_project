// Test setup file
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = "test";

// Global test timeout
jest.setTimeout(10000);

// Mock console.log in tests to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
