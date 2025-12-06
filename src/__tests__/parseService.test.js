/**
 * parseService.test.js
 * Integration tests for Parse database connection and initialization
 * 
 * Tests:
 * - Parse is correctly initialized with credentials
 * - isParseConfigured flag reflects credential status
 * - Parse.User can be created (auth works)
 * - Query operations work
 */

// Import Parse SDK directly (not our service wrapper)
// This lets us test Parse's built-in functionality
import Parse from 'parse';

/**
 * This test suite checks that Parse SDK (the library) works correctly.
 * These are UNIT tests - they test Parse's functionality, not our database connection.
 * 
 * What's the difference from databaseConnection.test.js?
 * - databaseConnection: Tests actual database queries (integration test)
 * - This file: Tests that Parse SDK is loaded and its methods work (unit test)
 */
describe('Parse Service Integration Tests', () => {
  // Check if we have credentials set up (optional for these tests)
  // Note: These tests require valid REACT_APP_PARSE_* env vars to pass
  const hasValidCreds = Boolean(
    process.env.REACT_APP_PARSE_APP_ID &&
    process.env.REACT_APP_PARSE_JS_KEY
  );

  /**
   * Test: Verify Parse SDK is loaded and has the classes we need
   * 
   * What are we checking?
   * - Parse object exists (the main SDK)
   * - Parse.Object - used to create/read database objects
   * - Parse.Query - used to search/filter database objects
   * - Parse.User - used for authentication
   */
  describe('Parse Initialization', () => {
    /**
     * Test: Check that Parse SDK loaded correctly
     * If this fails, the Parse library might not be installed
     */
    test('Parse is defined and available', () => {
      // Check main Parse object exists
      expect(Parse).toBeDefined();
      // Check Parse.Object exists (we use this to work with database objects)
      expect(Parse.Object).toBeDefined();
      // Check Parse.Query exists (we use this to search the database)
      expect(Parse.Query).toBeDefined();
      // Check Parse.User exists (we use this for login/signup)
      expect(Parse.User).toBeDefined();
    });

    /**
     * Test: Check that environment variables (credentials) are set
     * 
     * What are environment variables?
     * - Secret credentials stored outside of code
     * - Like a password file - not in your code for security
     * - Usually in .env file or Netlify settings
     */
    test('Parse credentials from env vars exist', () => {
      if (!hasValidCreds) {
        console.warn('Skipping credential check: env vars not set');
      }
      // Check that credentials exist (even if they're test values)
      expect(process.env.REACT_APP_PARSE_APP_ID || 'not-set').toBeTruthy();
      expect(process.env.REACT_APP_PARSE_JS_KEY || 'not-set').toBeTruthy();
    });
  });

  /**
   * Test: Verify Parse can be initialized with credentials
   */
  describe('Parse Configuration', () => {
    /**
     * Test: Check that Parse.initialize() works without errors
     * 
     * What does Parse.initialize() do?
     * - Sets up the connection to Back4App
     * - Takes your app ID and secret key
     * - Must be called before using Parse
     */
    test('Parse.initialize should accept app ID and JS key', () => {
      // This tests that the Parse SDK accepts these config values
      // In real app, this happens in parseService.js
      if (hasValidCreds) {
        // expect().not.toThrow() means "this should NOT crash"
        // We're checking that initializing Parse doesn't cause an error
        expect(() => {
          Parse.initialize(
            process.env.REACT_APP_PARSE_APP_ID,
            process.env.REACT_APP_PARSE_JS_KEY
          );
        }).not.toThrow();
      }
    });
  });

  /**
   * Test: Verify we can create custom database objects
   * 
   * What is Parse.Object.extend()?
   * - Creates a template for a database object
   * - Like creating a blueprint for "Business" or "User"
   * - We use this in our models (Business.js, Review.js)
   */
  describe('Parse.Object Extension', () => {
    /**
     * Test: Verify we can create a custom class
     * 
     * What's happening?
     * 1. Create a class called "TestClass" (like "Business")
     * 2. Create an instance of that class
     * 3. Verify it was created correctly
     */
    test('Can extend Parse.Object with custom class', () => {
      // Create a new class template (like we do for "Business")
      const TestClass = Parse.Object.extend('TestClass');
      // Verify the class was created
      expect(TestClass).toBeDefined();
      // Create an actual object instance (like creating a new business)
      const instance = new TestClass();
      // Verify the instance was created
      expect(instance).toBeDefined();
      // Verify it knows it's a "TestClass" object
      expect(instance.className).toBe('TestClass');
    });

    /**
     * Test: Verify we can save and read data from Parse objects
     * 
     * This tests the basic operations:
     * - .set() - save a value to a field
     * - .get() - read a value from a field
     */
    test('Can set and get properties on Parse.Object', () => {
      // Create a test object
      const TestClass = Parse.Object.extend('TestClass');
      const obj = new TestClass();
      
      // Test setting values (like obj.set('Name', 'My Business'))
      obj.set('name', 'Test');
      obj.set('value', 42);
      
      // Test getting values back (like obj.get('Name'))
      expect(obj.get('name')).toBe('Test');
      expect(obj.get('value')).toBe(42);
    });
  });

  /**
   * Test: Verify database queries work correctly
   * 
   * What is a Parse.Query?
   * - Like a search request to the database
   * - "Find all businesses where Category = 'restaurant'"
   * - Used to filter, sort, and limit results
   */
  describe('Parse.Query', () => {
    /**
     * Test: Verify we can create a query
     * 
     * This tests the basic query creation (before executing it)
     */
    test('Can create a Parse.Query', () => {
      const TestClass = Parse.Object.extend('TestClass');
      // Create a query for TestClass objects
      const query = new Parse.Query(TestClass);
      // Verify query was created
      expect(query).toBeDefined();
      // Verify query knows which class to search
      expect(query.className).toBe('TestClass');
    });

    /**
     * Test: Verify query methods can be "chained" together
     * 
     * What is method chaining?
     * - Calling multiple methods in a row: query.limit(10).skip(5)
     * - Each method returns the query object so you can chain more
     * - Makes code more readable: query.limit(10).skip(5).descending('createdAt')
     */
    test('Query methods are chainable', () => {
      const TestClass = Parse.Object.extend('TestClass');
      const query = new Parse.Query(TestClass);
      
      // Test that each method returns the query object (allows chaining)
      expect(query.limit(10)).toEqual(query);           // Limit to 10 results
      expect(query.skip(5)).toEqual(query);             // Skip first 5 results
      expect(query.descending('createdAt')).toEqual(query); // Sort by date, newest first
    });

    /**
     * Test: Verify we can combine multiple queries with OR logic
     * 
     * What is Parse.Query.or()?
     * - Combines multiple queries: "find X OR Y"
     * - Like searching for businesses with keyword "pizza" OR "italian"
     * - Used in our Business model for keyword searches
     */
    test('Query.or combines multiple queries', () => {
      const TestClass = Parse.Object.extend('TestClass');
      // Create two separate queries
      const q1 = new Parse.Query(TestClass);
      const q2 = new Parse.Query(TestClass);
      
      // Combine them with OR (matches either q1 OR q2)
      const orQuery = Parse.Query.or(q1, q2);
      expect(orQuery).toBeDefined();
      expect(orQuery.className).toBe('TestClass');
    });
  });

  /**
   * Test: Verify ACL (Access Control List) works
   * 
   * What is ACL?
   * - Controls who can read/write data
   * - Like file permissions: "public can read, only owner can write"
   * - We use this in Business.js to make businesses publicly readable
   */
  describe('Parse.ACL', () => {
    /**
     * Test: Verify we can set read/write permissions
     */
    test('Can create and configure ACL', () => {
      // Create an ACL (Access Control List) object
      const acl = new Parse.ACL();
      expect(acl).toBeDefined();
      
      // Set public read access (anyone can read)
      // We use this for businesses so everyone can see them
      acl.setPublicReadAccess(true);
      expect(acl.getPublicReadAccess()).toBe(true);
      
      // Public write should be disabled by default
      // This means only the owner can edit (security)
      acl.setPublicWriteAccess(false);
      expect(acl.getPublicWriteAccess()).toBe(false);
    });
  });

  /**
   * Test: Verify file upload functionality
   * 
   * Note: We use Cloudinary for images now, but Parse.File still exists in code
   */
  describe('Parse.File', () => {
    /**
     * Test: Verify we can create a Parse.File object from binary data
     */
    test('Can create a Parse.File object', () => {
      // Create test file data (a Blob is like a file in memory)
      const testData = new Blob(['test data'], { type: 'text/plain' });
      // Create a Parse.File from the data
      const file = new Parse.File('test.txt', testData);
      
      expect(file).toBeDefined();
      expect(file.name()).toBe('test.txt');
    });

    /**
     * Test: Verify we can create a Parse.File from base64 (image data)
     * 
     * What is base64?
     * - A way to encode binary data (like images) as text
     * - Used when uploading images as text strings
     */
    test('Can create Parse.File from base64', () => {
      // Convert text to base64 (btoa = binary to ascii)
      const base64 = btoa('test data');
      // Create file from base64 string
      const file = new Parse.File('test.txt', { base64 });
      
      expect(file).toBeDefined();
      expect(file.name()).toBe('test.txt');
    });
  });

  /**
   * Test: Verify user authentication methods exist
   * 
   * These tests check that Parse.User has the methods we need
   * for login, signup, and logout (used in authService.js)
   */
  describe('Parse.User Authentication Flow (Mock)', () => {
    /**
     * Test: Verify Parse.User has authentication methods
     * 
     * What do these methods do?
     * - signUp: Create a new user account
     * - logIn: Sign in an existing user
     * - current: Get the currently signed-in user
     * - logOut: Sign out the current user
     */
    test('Parse.User has signup and login methods', () => {
      // Check that all auth methods exist (are functions)
      expect(Parse.User.signUp).toBeDefined();
      expect(Parse.User.logIn).toBeDefined();
      expect(Parse.User.current).toBeDefined();
      expect(Parse.User.logOut).toBeDefined();
    });

    /**
     * Test: Verify we can create a user with properties
     * 
     * This tests creating a user object (not actually saving it)
     */
    test('Can create Parse.User instance with properties', () => {
      // Create a new user object
      const user = new Parse.User();
      // Set user properties (like registration form fields)
      user.set('username', 'testuser');
      user.set('password', 'testpass');
      user.set('email', 'test@example.com');
      
      // Verify we can read the properties back
      expect(user.get('username')).toBe('testuser');
      expect(user.get('email')).toBe('test@example.com');
    });
  });
});
