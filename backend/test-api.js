const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    console.log('🧪 Testing Store Rating Platform API with SQLite...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Login with default admin user
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    const adminToken = loginResponse.data.token;

    // Test 3: Create a new user
    console.log('\n3. Testing user creation...');
    const newUserResponse = await axios.post(`${BASE_URL}/api/users`, {
      name: 'Test Store Owner User Name',
      email: 'storeowner@test.com',
      password: 'Password123!',
      address: '123 Test Street',
      role: 'Store Owner'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User created:', newUserResponse.data.user.name);

    // Test 4: Create a store
    console.log('\n4. Testing store creation...');
    const storeResponse = await axios.post(`${BASE_URL}/api/stores`, {
      name: 'Test Store',
      address: '456 Store Avenue',
      owner_id: newUserResponse.data.user.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Store created:', storeResponse.data.store.name);

    // Test 5: Create a normal user
    console.log('\n5. Testing normal user registration...');
    const normalUserResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test Normal User Full Name',
      email: 'normaluser@test.com',
      password: 'Password123!',
      address: '789 User Lane'
    });
    console.log('✅ Normal user registered:', normalUserResponse.data.user.name);
    const normalUserToken = normalUserResponse.data.token;

    // Test 6: Submit a rating
    console.log('\n6. Testing rating submission...');
    const ratingResponse = await axios.post(`${BASE_URL}/api/ratings/${storeResponse.data.store.id}`, {
      rating_value: 5
    }, {
      headers: { Authorization: `Bearer ${normalUserToken}` }
    });
    console.log('✅ Rating submitted:', ratingResponse.data.rating.ratingValue);

    // Test 7: Get stores with ratings
    console.log('\n7. Testing store listing with ratings...');
    const storesResponse = await axios.get(`${BASE_URL}/api/stores`, {
      headers: { Authorization: `Bearer ${normalUserToken}` }
    });
    console.log('✅ Stores retrieved:', storesResponse.data.stores.length, 'stores');
    console.log('   Store rating:', storesResponse.data.stores[0].averageRating);

    // Test 8: Get admin dashboard
    console.log('\n8. Testing admin dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin dashboard data:');
    console.log('   Total users:', dashboardResponse.data.statistics.totalUsers);
    console.log('   Total stores:', dashboardResponse.data.statistics.totalStores);
    console.log('   Total ratings:', dashboardResponse.data.statistics.totalRatings);

    console.log('\n🎉 All tests passed! SQLite migration is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
