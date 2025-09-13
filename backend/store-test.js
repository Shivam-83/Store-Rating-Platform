const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testStores() {
  try {
    console.log('🧪 Testing Store Functionality...\n');

    // Login as admin to create test data
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    // Create a store owner
    const timestamp = Date.now();
    const ownerResponse = await axios.post(`${BASE_URL}/api/users`, {
      name: `Store Owner Test User ${timestamp}`,
      email: `owner${timestamp}@test.com`,
      password: 'Password123!',
      address: '123 Owner Street',
      role: 'Store Owner'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Store owner created');

    // Create a store
    const storeResponse = await axios.post(`${BASE_URL}/api/stores`, {
      name: `Test Store ${timestamp}`,
      address: '456 Store Avenue',
      owner_id: ownerResponse.data.user.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Store created:', storeResponse.data.store.name);

    // Register normal user
    const userResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: `Normal User Test ${timestamp}`,
      email: `user${timestamp}@test.com`,
      password: 'Password123!',
      address: '789 User Lane'
    });
    const userToken = userResponse.data.token;
    console.log('✅ Normal user registered');

    // Test store listing (this was failing before)
    console.log('\n🔍 Testing store listing...');
    const storesResponse = await axios.get(`${BASE_URL}/api/stores`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Stores retrieved successfully:', storesResponse.data.stores.length, 'stores');
    
    if (storesResponse.data.stores.length > 0) {
      const store = storesResponse.data.stores[0];
      console.log('   Store details:', store.name, '- Rating:', store.averageRating);
    }

    console.log('\n🎉 Store functionality test PASSED!');
    console.log('✅ Store creation works');
    console.log('✅ Store listing works');
    console.log('✅ SQLite complex queries resolved');

  } catch (error) {
    console.error('❌ Store test failed:', error.response?.data || error.message);
  }
}

testStores();
