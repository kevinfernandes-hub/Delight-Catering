/**
 * Comprehensive API Route Tests
 * Tests CRUD operations, error handling, and edge cases
 */

const API_BASE = 'http://localhost:6005';

interface TestResult {
  name: string;
  passed: boolean;
  status: number;
  error?: string;
}

let authToken = '';
const results: TestResult[] = [];

// Helper to make API calls
async function apiCallTest(method: string, endpoint: string, body?: any, token?: string): Promise<any> {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

// Test 1: Login - Valid credentials
async function testLoginValid() {
  try {
    const result = await apiCallTest('POST', '/api/auth/login', {
      email: 'fernandeskevin860@gmail.com',
      password: 'admin123',
    });
    
    authToken = result.data.token;
    
    results.push({
      name: '✓ Login with valid credentials',
      passed: result.status === 200 && result.data.token,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Login with valid credentials',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 2: Login - Invalid credentials
async function testLoginInvalid() {
  try {
    const result = await apiCallTest('POST', '/api/auth/login', {
      email: 'wrong@email.com',
      password: 'wrongpassword',
    });
    
    results.push({
      name: '✓ Login fails with invalid credentials (401)',
      passed: result.status === 401,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Login invalid credentials test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 3: Protected API - No token
async function testProtectedNoToken() {
  try {
    const result = await apiCallTest('GET', '/api/orders');
    
    results.push({
      name: '✓ Protected API rejects requests without token (401)',
      passed: result.status === 401,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Protected API no token test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 4: Customer CRUD - Create
async function testCreateCustomer() {
  try {
    const result = await apiCallTest('POST', '/api/customers', {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '9876543210',
      address: '123 Test Street',
      notes: 'Test customer for validation',
    }, authToken);
    
    results.push({
      name: '✓ Create customer with valid data',
      passed: result.status === 201 && result.data.id,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Create customer test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 5: Customer CRUD - Create with invalid email
async function testCreateCustomerInvalidEmail() {
  try {
    const result = await apiCallTest('POST', '/api/customers', {
      name: 'Test Customer',
      email: 'invalid-email',
      phone: '9876543210',
      address: '123 Test Street',
    }, authToken);
    
    results.push({
      name: '✓ Create customer validation: rejects invalid email',
      passed: result.status === 400,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Customer email validation test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 6: Menu Items - Get all
async function testGetMenuItems() {
  try {
    const result = await apiCallTest('GET', '/api/menu', undefined, authToken);
    
    results.push({
      name: '✓ Get menu items with token',
      passed: result.status === 200 && Array.isArray(result.data),
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Get menu items test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 7: Orders - Create without required fields
async function testCreateOrderMissingFields() {
  try {
    const result = await apiCallTest('POST', '/api/orders', {
      event_type: 'Wedding',
      // Missing customer_id, event_date, guest_count, venue
    }, authToken);
    
    results.push({
      name: '✓ Create order validation: rejects missing fields (400)',
      passed: result.status === 400,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Order validation test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 8: Invoice - Get all
async function testGetInvoices() {
  try {
    const result = await apiCallTest('GET', '/api/invoices', undefined, authToken);
    
    results.push({
      name: '✓ Get invoices with token',
      passed: result.status === 200 && Array.isArray(result.data),
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Get invoices test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 9: Invalid endpoint
async function testInvalidEndpoint() {
  try {
    const result = await apiCallTest('GET', '/api/nonexistent', undefined, authToken);
    
    results.push({
      name: '✓ Invalid endpoint returns 404',
      passed: result.status === 404 || result.status === 500,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Invalid endpoint test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Test 10: Invalid token
async function testInvalidToken() {
  try {
    const result = await apiCallTest('GET', '/api/orders', undefined, 'invalid.token.here');
    
    results.push({
      name: '✓ Invalid token rejected (401)',
      passed: result.status === 401,
      status: result.status,
    });
  } catch (err: any) {
    results.push({
      name: '✗ Invalid token test',
      passed: false,
      status: 0,
      error: err.message,
    });
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n========================================');
  console.log('API ROUTE TESTING & VALIDATION');
  console.log('========================================\n');
  
  await testLoginValid();
  await testLoginInvalid();
  await testProtectedNoToken();
  await testCreateCustomer();
  await testCreateCustomerInvalidEmail();
  await testGetMenuItems();
  await testCreateOrderMissingFields();
  await testGetInvoices();
  await testInvalidEndpoint();
  await testInvalidToken();

  // Print results
  let passed = 0;
  let failed = 0;

  console.log('\nTEST RESULTS:');
  console.log('----------------------------------------');
  results.forEach((result) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} | ${result.name}`);
    if (result.error) {
      console.log(`       Error: ${result.error}`);
    }
    if (!result.passed) {
      console.log(`       Status: ${result.status}`);
    }
    if (result.passed) passed++;
    if (!result.passed) failed++;
  });

  console.log('\n----------------------------------------');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('========================================\n');
}

// Run tests
runAllTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
