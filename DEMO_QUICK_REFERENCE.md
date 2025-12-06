# Demo Quick Reference Card

## Primary Demo: Database Connectivity Test

### Command to Run:
```bash
npm test -- databaseConnection.test.js --verbose
```

### What It Demonstrates:
✅ Parse/Back4App database connection established  
✅ Real database queries executed successfully  
✅ Business class is accessible  
✅ Database is responsive  

### Expected Output:
```
✓ Parse SDK is initialized and configured
✓ Parse credentials are set  
✓ Database query successful - Found X business(es)
✓ Business model helper works
✓ Database is responsive - Business count: X

PASS src/__tests__/databaseConnection.test.js
  Database Connection Integration Test
    Parse Service Initialization
      ✓ Parse SDK is initialized and configured
      ✓ Parse credentials are set
    Database Query Operations
      ✓ Can query Business class from database
      ✓ Can use Business model helper to fetch businesses
    Database Schema Verification
      ✓ Business class exists and has expected structure
    Connection Health Check
      ✓ Database is accessible and responsive
      ✓ Parse server URL is reachable

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

---

## Secondary Demo: Business Model Tests

### Command to Run:
```bash
npm test -- Business.test.js --verbose
```

### What It Demonstrates:
✅ Business logic functions work correctly  
✅ Data validation and sanitization  
✅ Query utilities function properly  

### Expected Output:
```
PASS src/__tests__/Business.test.js
  Business Model Unit Tests
    Filename Sanitization
      ✓ should allow alphanumeric filenames
      ✓ should reject filenames with spaces and special characters
      ✓ sanitization examples
      ✓ should handle edge cases
    Business Object Structure
      ✓ Business object should have required fields
      ✓ Keywords should be stored as array
      ✓ Addresses should include primary + additional locations
    Query Utilities
      ✓ Keyword regex matching should be case-insensitive
      ✓ Keyword singular/plural variations
      ✓ Category regex should escape special characters
    Data Normalization
      ✓ toPlain should convert Parse.Object to plain JS object
      ✓ null objects should return null
    Address Formatting
      ✓ should format address as "Street, City, State ZIP"
      ✓ should handle missing address components
    Error Handling
      ✓ should handle missing required fields gracefully
      ✓ should catch file processing errors

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

---

## Complete Test Suite

### Command to Run:
```bash
npm test -- --testPathPattern="(databaseConnection|Business|parseService|authService)" --watchAll=false
```

### What It Demonstrates:
✅ Full integration test coverage  
✅ Database connectivity  
✅ Business logic  
✅ Parse SDK integration  
✅ Authentication services  

---

## Key Talking Points

1. **Integration Testing**: "We have integration tests that verify our actual database connection to Back4App."

2. **Real Queries**: "These tests perform real database queries, not mocks, proving connectivity works."

3. **Comprehensive Coverage**: "Our test suite covers database operations, business logic, and component functionality."

4. **Live Demo**: "Let me run the database connection test to show you..."

---

## Troubleshooting

**If tests fail to run:**
```bash
npm install
```

**If database connection fails:**
- Check internet connection
- Verify Parse credentials in `src/services/parseService.js`
- Test Back4App API: `curl https://parseapi.back4app.com/`

**If you see module errors:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## Files to Reference

- **Database Test**: `src/__tests__/databaseConnection.test.js`
- **Business Tests**: `src/__tests__/Business.test.js`
- **Parse Service**: `src/services/parseService.js`
- **Business Model**: `src/models/Business.js`

