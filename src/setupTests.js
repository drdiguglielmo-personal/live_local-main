/**
 * setupTests.js
 * Configuration for Jest test environment
 * Runs before each test suite
 */

// Import testing library matchers
import '@testing-library/jest-dom';

// Suppress console warnings in tests for cleaner output
// Only suppress in test environment, not in development
if (process.env.NODE_ENV === 'test') {
  // Suppress React act() warnings - these are expected in async tests
  const originalError = console.error;
  const originalLog = console.log;
  
  console.error = (...args) => {
    // Filter out act() warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('act(...)') || 
       args[0].includes('not wrapped in act'))
    ) {
      return;
    }
    // Filter out expected error logs from error handling tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error saving business') ||
       args[0].includes('Cloudinary upload result'))
    ) {
      return;
    }
    // Filter out jsdom "Not implemented" warnings (window.alert, etc.)
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Suppress console.log in tests for cleaner output
  console.log = (...args) => {
    // Filter out expected logs from Application component during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Cloudinary upload result') ||
       args[0].includes('Business payload being sent') ||
       args[0].includes('Saved business:'))
    ) {
      return;
    }
    originalLog.call(console, ...args);
  };
}

// Suppress console errors/warnings during tests (optional)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });

// afterAll(() => {
//   console.error = originalError;
// });

// Mock window.matchMedia (for responsive design tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.alert (used in Application component)
window.alert = jest.fn();

// Set up environment variables for testing
process.env.REACT_APP_PARSE_APP_ID = 'test-app-id';
process.env.REACT_APP_PARSE_JS_KEY = 'test-js-key';
process.env.REACT_APP_PARSE_SERVER_URL = 'https://parseapi.back4app.com/';
