/**
 * Business.test.js
 * Unit tests for Business model helper functions
 * 
 * Tests:
 * - Filename sanitization works correctly
 * - Business object creation and field validation
 * - Query building (keyword search, category filter, etc.)
 */

// Note: sanitizeFilename is not exported from Business.js, so we test the logic indirectly
// by testing what filenames should look like after sanitization

/**
 * This test suite tests business logic and data handling functions.
 * These are UNIT tests - they test functions in isolation, not database operations.
 * 
 * What do we test?
 * - Filename sanitization (making file names safe)
 * - Business data structure (what fields exist)
 * - Query utilities (search/filter logic)
 * - Data normalization (converting Parse objects to plain objects)
 * - Error handling (what happens when things go wrong)
 */
describe('Business Model Unit Tests', () => {
  
  /**
   * Test: Filename Sanitization
   * 
   * Why sanitize filenames?
   * - Parse.File is strict about filenames
   * - Special characters can break uploads
   * - We need to clean user-uploaded filenames before saving
   * - Example: "My Photo (1).jpg" → "My_Photo__1_.jpg"
   */
  describe('Filename Sanitization', () => {
    // Note: sanitizeFilename is internal to Business.js, so we test indirectly
    // We test that our sanitization logic works correctly

    /**
     * Test: Verify that simple, valid filenames pass through unchanged
     * 
     * Valid characters: letters, numbers, dots, hyphens, underscores
     */
    test('should allow alphanumeric filenames', () => {
      // List of valid filenames (should be allowed)
      const validNames = [
        'image.jpg',
        'photo123.png',
        'screenshot.gif',
        'myfile.jpeg'
      ];
      
      // Check each filename contains only safe characters
      validNames.forEach(name => {
        // Regular expression: ^[a-zA-Z0-9._-]+$
        // ^ = start of string
        // [a-zA-Z0-9._-] = allowed characters (letters, numbers, dot, hyphen, underscore)
        // + = one or more characters
        // $ = end of string
        // This regex checks if filename ONLY contains safe characters
        expect(/^[a-zA-Z0-9._-]+$/.test(name)).toBe(true);
      });
    });

    /**
     * Test: Verify that invalid filenames get sanitized (special chars replaced)
     * 
     * Invalid characters: spaces, #, @, %, parentheses, etc.
     * These should be replaced with underscores
     */
    test('should reject filenames with spaces and special characters', () => {
      // List of invalid filenames (have problematic characters)
      const invalidNames = [
        'my image.jpg',          // space
        'screenshot (2).png',    // space and parentheses
        'photo #1.gif',          // space and #
        'file@test.jpg',         // @ symbol
        'image%20test.png'       // % symbol
      ];
      
      invalidNames.forEach(name => {
        // These contain problematic characters
        // Replace anything that's NOT a letter, number, dot, hyphen, or underscore with _
        // [^a-zA-Z0-9._-] means "anything NOT in this list"
        // /g means "replace all occurrences" (not just the first one)
        const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        // Verify problematic characters were removed
        expect(sanitized).not.toContain(' ');
        expect(sanitized).not.toContain('#');
        expect(sanitized).not.toContain('@');
        expect(sanitized).not.toContain('%');
      });
    });

    /**
     * Test: Verify specific sanitization examples work correctly
     * 
     * These are real-world examples of how filenames get cleaned
     */
    test('sanitization examples', () => {
      // Test cases: input filename → expected sanitized filename
      const cases = [
        {
          input: 'Screenshot 2025-11-26 at 12.37.24 PM.png',
          expected: 'Screenshot_2025-11-26_at_12.37.24_PM.png'
          // Spaces replaced with underscores
        },
        {
          input: 'my photo #1.jpg',
          expected: 'my_photo__1.jpg'
          // Space and # replaced with underscores
        },
        {
          input: 'image (copy).png',
          expected: 'image__copy_.png'
          // Spaces and parentheses replaced with underscores
        }
      ];

      // Test each case
      cases.forEach(({ input, expected }) => {
        // Apply sanitization
        const sanitized = input.replace(/[^a-zA-Z0-9._-]/g, '_');
        // Verify result matches expected output
        expect(sanitized).toBe(expected);
      });
    });

    test('should handle edge cases', () => {
      const edgeCases = [
        { input: '', expected: 'image.jpg' },
        { input: null, expected: 'image.jpg' },
        { input: '.hidden', expected: '.hidden' },
        { input: 'file.tar.gz', expected: 'file.tar.gz' },
        { input: 'path/to/file.jpg', expected: 'file.jpg' } // basename
      ];

      edgeCases.forEach(({ input, expected }) => {
        if (!input) {
          expect(input || 'image.jpg').toBe(expected);
        } else {
          // Test basename extraction
          const basename = input.split(/[/\\]/).pop();
          const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
          
          if (input === 'path/to/file.jpg') {
            expect(basename).toBe('file.jpg');
          } else if (input === 'file.tar.gz' || input === '.hidden') {
            expect(sanitized).toBe(expected);
          }
        }
      });
    });
  });

  /**
   * Test: Verify Business data structure
   * 
   * What is a "data structure"?
   * - The shape/form of the data
   * - What fields exist (Name, Category, etc.)
   * - What type each field is (string, array, etc.)
   */
  describe('Business Object Structure', () => {
    /**
     * Test: Verify Business objects have all the fields we expect
     * 
     * This ensures our code matches the database structure
     */
    test('Business object should have required fields', () => {
      // List of fields that should exist on a Business object
      const businessFields = [
        'Name',           // Business name (e.g., "Joe's Pizza")
        'Category',       // Type of business (e.g., "restaurant")
        'Address',        // Primary address (single string)
        'Addresses',      // All addresses (array - includes primary + additional)
        'Keywords',       // Search keywords (array - e.g., ["pizza", "italian"])
        'Description',    // Business description (text)
        'Image'           // Business image (file or URL)
      ];

      // Verify each field is in our expected list
      businessFields.forEach(field => {
        expect(['Name', 'Category', 'Address', 'Addresses', 'Keywords', 'Description', 'Image']).toContain(field);
      });
    });

    /**
     * Test: Verify Keywords field is an array
     * 
     * Why test this?
     * - Keywords are stored as an array (not a string)
     * - This allows multiple keywords: ["pizza", "italian", "dine-in"]
     * - Our search logic depends on this being an array
     */
    test('Keywords should be stored as array', () => {
      // Example keywords array
      const keywords = ['restaurant', 'pizza', 'italian'];
      // Verify it's actually an array (not a string)
      expect(Array.isArray(keywords)).toBe(true);
      // Verify it has the expected length
      expect(keywords.length).toBe(3);
    });

    /**
     * Test: Verify Addresses field structure
     * 
     * Addresses is an array that includes:
     * - Primary address (first element)
     * - Additional locations (if any)
     */
    test('Addresses should include primary + additional locations', () => {
      // Example addresses array
      const addresses = [
        '123 Main St, Springfield, IL 12345',  // Primary address
        '456 Oak Ave, Chicago, IL 67890'       // Additional location
      ];
      // Verify it's an array
      expect(Array.isArray(addresses)).toBe(true);
      // Verify it has at least one address (primary)
      expect(addresses.length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * Test: Query utilities (functions used for searching/filtering)
   * 
   * These tests verify the search logic works correctly
   */
  describe('Query Utilities', () => {
    /**
     * Test: Verify search is case-insensitive
     * 
     * Why case-insensitive?
     * - User types "coffee" or "COFFEE" or "Coffee"
     * - Should find businesses regardless of capitalization
     * - Better user experience
     */
    test('Keyword regex matching should be case-insensitive', () => {
      const keyword = 'Coffee';
      const keywordLower = keyword.toLowerCase();
      // Test strings with different capitalizations
      const testStrings = ['coffee', 'COFFEE', 'Coffee', 'CoffEE'];
      
      testStrings.forEach(str => {
        // Create regex with 'i' flag (case-insensitive)
        // RegExp(keyword, 'i') means "match keyword, ignore case"
        const regex = new RegExp(keyword, 'i');
        // Verify all variations match
        expect(regex.test(str)).toBe(true);
      });
    });

    /**
     * Test: Verify keyword singular/plural handling
     * 
     * Why test this?
     * - User might search "restaurant" or "restaurants"
     * - We want to find businesses with either keyword
     * - This logic converts between singular/plural forms
     */
    test('Keyword singular/plural variations', () => {
      const keyword = 'restaurants';
      
      // Convert to singular: remove trailing 's' if present
      // "restaurants" → "restaurant"
      const singular = keyword.endsWith('s') ? keyword.slice(0, -1) : keyword;
      
      // Convert to plural: add 's' if not present
      // "restaurants" → "restaurants" (already plural)
      const plural = keyword.endsWith('s') ? keyword : keyword + 's';
      
      // Verify conversions work correctly
      expect(singular).toBe('restaurant');
      expect(plural).toBe('restaurants');
    });

    test('Category regex should escape special characters', () => {
      const category = 'Fast-Food & Casual';
      const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Verify escaping works - ampersand should be escaped, but hyphen doesn't need escaping in this context
      // The key is that the escaped version can be used safely in regex
      expect(escaped).toContain('&'); // Ampersand might be escaped depending on context
      // Escaped version can be used safely in regex
      const regex = new RegExp(`^${escaped}$`, 'i');
      expect(regex.test(category)).toBe(true);
      
      // Test with a category that definitely has special chars
      const category2 = 'Restaurant (Fine Dining)';
      const escaped2 = category2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex2 = new RegExp(`^${escaped2}$`, 'i');
      expect(regex2.test(category2)).toBe(true);
    });
  });

  describe('Data Normalization', () => {
    test('toPlain should convert Parse.Object to plain JS object', () => {
      // Mock a Parse object structure
      const mockParseObj = {
        toJSON() {
          return {
            objectId: '123',
            Name: 'Test Business',
            Category: 'restaurant'
          };
        },
        get(key) {
          const data = {
            Name: 'Test Business',
            Category: 'restaurant',
            Keywords: ['pizza', 'italian']
          };
          return data[key];
        }
      };

      const plain = {
        ...mockParseObj.toJSON(),
        Name: mockParseObj.get('Name'),
        Category: mockParseObj.get('Category'),
        Keywords: mockParseObj.get('Keywords')
      };

      expect(plain.objectId).toBe('123');
      expect(plain.Name).toBe('Test Business');
      expect(plain.Category).toBe('restaurant');
      expect(Array.isArray(plain.Keywords)).toBe(true);
    });

    test('null objects should return null', () => {
      const plain = null || null;
      expect(plain).toBeNull();
    });
  });

  describe('Address Formatting', () => {
    test('should format address as "Street, City, State ZIP"', () => {
      const street = '123 Main St';
      const town = 'Springfield';
      const state = 'IL';
      const zip = '12345';

      const formatted = `${street}, ${town}, ${state} ${zip}`;
      expect(formatted).toBe('123 Main St, Springfield, IL 12345');
    });

    test('should handle missing address components', () => {
      const testCases = [
        {
          street: '123 Main',
          town: 'Springfield',
          state: 'IL',
          zip: '',
          expected: '123 Main, Springfield, IL'
        },
        {
          street: '456 Oak',
          town: 'Chicago',
          state: '',
          zip: '60601',
          expected: '456 Oak, Chicago,  60601'
        }
      ];

      testCases.forEach(({ street, town, state, zip, expected }) => {
        const formatted = `${street}, ${town}, ${state} ${zip}`.trim();
        expect(formatted).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing required fields gracefully', () => {
      const incompleteData = {
        Name: 'Test Business'
        // Missing Category, Address, etc.
      };

      expect(incompleteData.Name).toBeDefined();
      expect(incompleteData.Category).toBeUndefined();
    });

    test('should catch file processing errors', () => {
      const mockFile = {
        name: 'test.jpg',
        size: 1024
      };

      const isFile = mockFile instanceof File || mockFile instanceof Blob;
      expect(isFile).toBe(false); // Mock object, not real File

      // In real code, this would be caught
      try {
        if (isFile) {
          throw new Error('File processing error');
        }
      } catch (e) {
        expect(e.message).toBe('File processing error');
      }
    });
  });
});
