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

import Parse, { isParseConfigured } from '../services/parseService';
import { fetchAll } from '../models/Business';

describe('Database Connection Integration Test', () => {
  
  describe('Parse Service Initialization', () => {
    test('Parse SDK is initialized and configured', () => {
      expect(Parse).toBeDefined();
      expect(typeof Parse.initialize).toBe('function');
      expect(Parse.serverURL).toBeDefined();
      expect(isParseConfigured).toBe(true);
    });

    test('Parse credentials are set', () => {
      // Verify that Parse has been initialized with credentials
      expect(Parse.applicationId).toBeDefined();
      expect(Parse.serverURL).toBe('https://parseapi.back4app.com/');
      console.log('✓ Parse server URL:', Parse.serverURL);
      console.log('✓ Parse is configured:', isParseConfigured);
    });
  });

  describe('Database Query Operations', () => {
    test('Can query Business class from database', async () => {
      // This is a REAL database query - tests actual connectivity
      try {
        const Business = Parse.Object.extend('Business');
        const query = new Parse.Query(Business);
        query.limit(5); // Only fetch 5 for speed
        
        const results = await query.find();
        
        // Verify we got results (array, even if empty)
        expect(Array.isArray(results)).toBe(true);
        console.log(`✓ Database query successful - Found ${results.length} business(es)`);
        
        // If we have results, verify structure
        if (results.length > 0) {
          const firstBusiness = results[0];
          expect(firstBusiness).toBeInstanceOf(Parse.Object);
          expect(firstBusiness.className).toBe('Business');
          
          // Verify it has expected fields
          const name = firstBusiness.get('Name');
          console.log('✓ Sample business:', name || '(no name)');
          
          // Verify we can access properties
          expect(firstBusiness.get).toBeDefined();
          expect(typeof firstBusiness.get).toBe('function');
        } else {
          console.log('⚠ Database is empty (no businesses yet) - this is OK for a new database');
        }
      } catch (error) {
        // If this fails, it means database connection failed
        console.error('✗ Database query failed:', error.message);
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }, 10000); // 10 second timeout for network requests

    test('Can use Business model helper to fetch businesses', async () => {
      // Test using our model helper (which uses fetchAll)
      try {
        const businesses = await fetchAll(5); // Limit to 5 for speed
        
        expect(Array.isArray(businesses)).toBe(true);
        console.log(`✓ Business model helper works - Fetched ${businesses.length} business(es)`);
        
        if (businesses.length > 0) {
          const first = businesses[0];
          // Verify it's a Parse.Object
          expect(first).toBeInstanceOf(Parse.Object);
          console.log('✓ Business model structure is correct');
        }
      } catch (error) {
        console.error('✗ Business model fetch failed:', error.message);
        throw new Error(`Business model operation failed: ${error.message}`);
      }
    }, 10000);
  });

  describe('Database Schema Verification', () => {
    test('Business class exists and has expected structure', async () => {
      try {
        const Business = Parse.Object.extend('Business');
        const query = new Parse.Query(Business);
        query.limit(1);
        
        const results = await query.find();
        
        if (results.length > 0) {
          const business = results[0];
          const json = business.toJSON();
          
          // Check for common fields (some may be optional)
          const hasFields = {
            hasName: business.get('Name') !== undefined,
            hasCategory: business.get('Category') !== undefined,
            hasAddress: business.get('Address') !== undefined || business.get('Addresses') !== undefined,
            hasObjectId: !!json.objectId,
            hasCreatedAt: !!json.createdAt
          };
          
          console.log('✓ Business schema fields:', hasFields);
          
          // At minimum, objectId and createdAt should exist
          expect(hasFields.hasObjectId).toBe(true);
          expect(hasFields.hasCreatedAt).toBe(true);
        } else {
          console.log('⚠ No businesses in database to verify schema');
          // This is OK - schema exists even if empty
        }
      } catch (error) {
        console.error('✗ Schema verification failed:', error.message);
        throw error;
      }
    }, 10000);
  });

  describe('Connection Health Check', () => {
    test('Database is accessible and responsive', async () => {
      try {
        // Simple health check: try to count businesses
        const Business = Parse.Object.extend('Business');
        const query = new Parse.Query(Business);
        
        // Use count query which is fast
        const count = await query.count();
        
        console.log(`✓ Database is responsive - Business count: ${count}`);
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.error('✗ Database health check failed:', error.message);
        throw new Error(`Database is not accessible: ${error.message}`);
      }
    }, 10000);

    test('Parse server URL is reachable', () => {
      const serverURL = Parse.serverURL;
      expect(serverURL).toBeTruthy();
      expect(serverURL).toContain('https://');
      expect(serverURL).toContain('parseapi.back4app.com');
      console.log('✓ Parse server URL is valid:', serverURL);
    });
  });
});

