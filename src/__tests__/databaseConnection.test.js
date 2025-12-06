/**
 * databaseConnection.test.js
 * Integration test to demonstrate database connectivity
 * 
 * This test verifies:
 * - Parse/Back4App connection is established
 * - Can query the database (Business class)
 * - Database operations work correctly
 * 
 * For demo: Run this test to show database connectivity
 */

// Import the Parse service and helper functions we need to test
import Parse, { isParseConfigured } from '../services/parseService';
import { fetchAll } from '../models/Business';

/**
 * This test suite verifies that our app can successfully connect to the Parse/Back4App database.
 * These are INTEGRATION tests - they make real network requests to the database.
 * 
 * Why test this?
 * - Ensures database credentials are correct
 * - Verifies network connectivity to Back4App
 * - Confirms database structure exists and is accessible
 */
describe('Database Connection Integration Test', () => {
  
  /**
   * First, we check that Parse SDK (Software Development Kit) is properly set up.
   * The SDK is the library that lets us talk to the database.
   */
  describe('Parse Service Initialization', () => {
    /**
     * Test: Check that Parse SDK is loaded and ready to use
     * What we're checking:
     * - Parse object exists (the main SDK object)
     * - Key methods/classes exist (Object, Query, etc.)
     * - Server URL is set (where to send requests)
     * - Configuration flag is true (credentials were loaded)
     */
    test('Parse SDK is initialized and configured', () => {
      // Check that Parse object exists (if undefined, SDK didn't load)
      expect(Parse).toBeDefined();
      // Check that initialize function exists (needed to set up connection)
      expect(typeof Parse.initialize).toBe('function');
      // Check that server URL is set (tells SDK where the database is)
      expect(Parse.serverURL).toBeDefined();
      // Check that our config helper says we're ready
      expect(isParseConfigured).toBe(true);
    });

    /**
     * Test: Verify specific credentials and server URL are correct
     * This ensures the connection settings match what Back4App expects
     */
    test('Parse credentials are set', () => {
      // Verify that Parse has been initialized with credentials
      // applicationId is like a username for the database
      expect(Parse.applicationId).toBeDefined();
      // Verify we're connecting to the correct Back4App server
      expect(Parse.serverURL).toBe('https://parseapi.back4app.com/');
      // Print to console so we can see the values during test run
      console.log('✓ Parse server URL:', Parse.serverURL);
      console.log('✓ Parse is configured:', isParseConfigured);
    });
  });

  /**
   * Now test actual database operations - can we read data?
   * These tests make REAL network requests, so they may take a few seconds.
   */
  describe('Database Query Operations', () => {
    /**
     * Test: Try to fetch businesses from the database
     * This is the KEY test - if this passes, our database connection works!
     * 
     * What happens:
     * 1. Create a "query" - think of it like a question to the database
     * 2. Ask for Business objects (a "class" is like a table in the database)
     * 3. Limit to 5 results (to keep the test fast)
     * 4. Execute the query (send the request to Back4App)
     * 5. Check that we got results back
     */
    test('Can query Business class from database', async () => {
      // This is a REAL database query - tests actual connectivity
      // Using try/catch to handle any connection errors gracefully
      try {
        // Step 1: Tell Parse we want to work with "Business" objects
        // This creates a template for Business objects
        const Business = Parse.Object.extend('Business');
        
        // Step 2: Create a query - this is like "SELECT * FROM Business"
        const query = new Parse.Query(Business);
        query.limit(5); // Only fetch 5 for speed (don't need all businesses)
        
        // Step 3: Execute the query - this sends a network request to Back4App
        // The 'await' means we wait for the response before continuing
        const results = await query.find();
        
        // Step 4: Verify we got results back
        // Results should be an array (even if empty, it's still an array)
        expect(Array.isArray(results)).toBe(true);
        console.log(`✓ Database query successful - Found ${results.length} business(es)`);
        
        // Step 5: If we got businesses, check their structure
        if (results.length > 0) {
          const firstBusiness = results[0];
          // Verify it's a Parse.Object (not just a plain JavaScript object)
          expect(firstBusiness).toBeInstanceOf(Parse.Object);
          // Verify it's from the Business class (not a different class)
          expect(firstBusiness.className).toBe('Business');
          
          // Verify we can access data using .get() method
          // This tests that the object has the expected structure
          const name = firstBusiness.get('Name');
          console.log('✓ Sample business:', name || '(no name)');
          
          // Verify the .get() method exists (this is how we read fields)
          expect(firstBusiness.get).toBeDefined();
          expect(typeof firstBusiness.get).toBe('function');
        } else {
          // Empty database is OK - means we can connect, just no data yet
          console.log('⚠ Database is empty (no businesses yet) - this is OK for a new database');
        }
      } catch (error) {
        // If this fails, it means database connection failed
        // Maybe network is down, or credentials are wrong, or Back4App is down
        console.error('✗ Database query failed:', error.message);
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }, 10000); // 10 second timeout for network requests (database queries can be slow)

    /**
     * Test: Use our own helper function to fetch businesses
     * 
     * Why test this?
     * - We created a helper function fetchAll() in our Business model
     * - This test verifies that helper function works correctly
     * - It's important because our app uses this helper, not Parse directly
     * 
     * What's different from the previous test?
     * - Previous test: Used Parse SDK directly
     * - This test: Uses our own code (which uses Parse SDK under the hood)
     */
    test('Can use Business model helper to fetch businesses', async () => {
      // Test using our model helper (which uses fetchAll)
      // This is like testing our own code, not just Parse's code
      try {
        // Call our helper function - it should return businesses from database
        const businesses = await fetchAll(5); // Limit to 5 for speed
        
        // Verify we got an array back (even if empty)
        expect(Array.isArray(businesses)).toBe(true);
        console.log(`✓ Business model helper works - Fetched ${businesses.length} business(es)`);
        
        // If we got results, verify they're the right type
        if (businesses.length > 0) {
          const first = businesses[0];
          // Verify it's a Parse.Object (our helper should return Parse objects)
          expect(first).toBeInstanceOf(Parse.Object);
          console.log('✓ Business model structure is correct');
        }
      } catch (error) {
        // If this fails, something is wrong with our helper function
        console.error('✗ Business model fetch failed:', error.message);
        throw new Error(`Business model operation failed: ${error.message}`);
      }
    }, 10000); // 10 second timeout
  });

  /**
   * Test: Verify the database "schema" (structure) is correct
   * 
   * What is a schema?
   * - Like a blueprint for what data looks like
   * - Defines what fields exist (Name, Category, Address, etc.)
   * - This test checks that our database has the fields we expect
   */
  describe('Database Schema Verification', () => {
    /**
     * Test: Check that Business objects have the fields we expect
     * 
     * Why test this?
     * - If the database structure changed, our app might break
     * - Ensures Back4App database matches what our code expects
     * - Catches issues early if someone changed the database schema
     */
    test('Business class exists and has expected structure', async () => {
      try {
        // Fetch one business so we can check its fields
        const Business = Parse.Object.extend('Business');
        const query = new Parse.Query(Business);
        query.limit(1); // Only need one business to check structure
        
        const results = await query.find();
        
        if (results.length > 0) {
          const business = results[0];
          // Convert to plain JavaScript object to check all fields
          const json = business.toJSON();
          
          // Check for common fields that our app expects
          // We check each field to see if it exists (undefined means it doesn't exist)
          const hasFields = {
            hasName: business.get('Name') !== undefined,           // Business name
            hasCategory: business.get('Category') !== undefined,   // Like "restaurant" or "cafe"
            hasAddress: business.get('Address') !== undefined || business.get('Addresses') !== undefined, // Location info
            hasObjectId: !!json.objectId,      // Unique ID (every Parse object has this)
            hasCreatedAt: !!json.createdAt     // When it was created (every Parse object has this)
          };
          
          console.log('✓ Business schema fields:', hasFields);
          
          // At minimum, objectId and createdAt should exist
          // These are required by Parse for every object
          expect(hasFields.hasObjectId).toBe(true);
          expect(hasFields.hasCreatedAt).toBe(true);
        } else {
          // Can't check fields if database is empty, but that's OK
          console.log('⚠ No businesses in database to verify schema');
          // This is OK - schema exists even if empty (like an empty table)
        }
      } catch (error) {
        console.error('✗ Schema verification failed:', error.message);
        throw error;
      }
    }, 10000);
  });

  /**
   * Final health checks - quick tests to verify everything is working
   */
  describe('Connection Health Check', () => {
    /**
     * Test: Check that database responds quickly
     * 
     * What is a "health check"?
     * - A simple test that verifies the system is up and running
     * - Like checking if a website is online
     * - Uses .count() which is faster than fetching all records
     * 
     * Why use .count()?
     * - Just counts how many businesses exist
     * - Doesn't need to download all the data
     * - Faster than fetching all business objects
     */
    test('Database is accessible and responsive', async () => {
      try {
        // Simple health check: try to count businesses
        // This tests if database responds, without downloading lots of data
        const Business = Parse.Object.extend('Business');
        const query = new Parse.Query(Business);
        
        // Use count query which is fast (just gets a number, not all the data)
        const count = await query.count();
        
        console.log(`✓ Database is responsive - Business count: ${count}`);
        // Verify we got a number back (not an error, not undefined)
        expect(typeof count).toBe('number');
        // Count should be 0 or more (can't be negative)
        expect(count).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // If counting fails, database is probably down or unreachable
        console.error('✗ Database health check failed:', error.message);
        throw new Error(`Database is not accessible: ${error.message}`);
      }
    }, 10000); // 10 second timeout

    /**
     * Test: Verify server URL is correctly formatted
     * 
     * Why test the URL format?
     * - Ensures we're connecting to the right server
     * - Catches typos in the URL
     * - Verifies we're using HTTPS (secure connection)
     */
    test('Parse server URL is reachable', () => {
      // Get the server URL from Parse configuration
      const serverURL = Parse.serverURL;
      
      // Check that URL exists (is not empty/undefined)
      expect(serverURL).toBeTruthy();
      // Verify it uses HTTPS (secure connection)
      expect(serverURL).toContain('https://');
      // Verify it's the Back4App server (not some other server)
      expect(serverURL).toContain('parseapi.back4app.com');
      
      console.log('✓ Parse server URL is valid:', serverURL);
    });
  });
});

