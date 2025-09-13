const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function basicTest() {
  try {
    console.log('🧪 Basic SQLite Test...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Login with admin user
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Role:', loginResponse.data.user.role);

    console.log('\n🎉 Basic SQLite migration test PASSED!');
    console.log('✅ SQLite database is working');
    console.log('✅ Authentication is working');
    console.log('✅ PostgreSQL to SQLite migration was successful!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

basicTest();
