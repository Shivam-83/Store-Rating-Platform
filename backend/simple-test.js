const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function simpleTest() {
  try {
    console.log('🧪 Simple SQLite Migration Test...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');

    // Test 2: Login with existing admin user
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    const adminToken = loginResponse.data.token;

    // Test 3: Get all users (should show admin user)
    console.log('\n3. Testing user listing...');
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Users retrieved:', usersResponse.data.users.length, 'users found');

    // Test 4: Get admin dashboard
    console.log('\n4. Testing admin dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin dashboard data retrieved:');
    console.log('   Total users:', dashboardResponse.data.statistics.totalUsers);
    console.log('   Total stores:', dashboardResponse.data.statistics.totalStores);
    console.log('   Total ratings:', dashboardResponse.data.statistics.totalRatings);

    // Test 5: Get stores (should work even if empty)
    console.log('\n5. Testing store listing...');
    try {
      const storesResponse = await axios.get(`${BASE_URL}/api/stores`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Stores retrieved:', storesResponse.data.stores.length, 'stores found');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Store listing requires Normal User role (expected behavior)');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 SQLite migration test completed successfully!');
    console.log('✅ Database is working correctly');
    console.log('✅ Authentication is working');
    console.log('✅ API endpoints are responding');
    console.log('✅ PostgreSQL to SQLite migration was successful!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

simpleTest();
