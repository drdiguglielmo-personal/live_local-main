/**
 * setupTests.js
 * Configuration for Jest test environment
 * Runs before each test suite
 */

// Import testing library matchers
import '@testing-library/jest-dom';

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

// Set up environment variables for testing
process.env.REACT_APP_PARSE_APP_ID = 'test-app-id';
process.env.REACT_APP_PARSE_JS_KEY = 'test-js-key';
process.env.REACT_APP_PARSE_SERVER_URL = 'https://parseapi.back4app.com/';
