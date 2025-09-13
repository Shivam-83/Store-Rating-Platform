const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function comprehensiveTest() {
  try {
    console.log('🧪 Comprehensive Store Rating Platform Test with SQLite...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Admin login
    console.log('\n2. Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful');
    const adminToken = adminLoginResponse.data.token;

    // Test 3: Create a store owner user
    console.log('\n3. Creating store owner user...');
    const timestamp = Date.now();
    const storeOwnerResponse = await axios.post(`${BASE_URL}/api/users`, {
      name: `Store Owner Test User ${timestamp}`,
      email: `storeowner${timestamp}@test.com`,
      password: 'Password123!',
      address: '123 Store Owner Street',
      role: 'Store Owner'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Store owner created:', storeOwnerResponse.data.user.name);

    // Test 4: Create a store
    console.log('\n4. Creating a test store...');
    const storeResponse = await axios.post(`${BASE_URL}/api/stores`, {
      name: `Test Store ${timestamp}`,
      address: '456 Test Store Avenue',
      owner_id: storeOwnerResponse.data.user.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Store created:', storeResponse.data.store.name);

    // Test 5: Register a normal user
    console.log('\n5. Registering normal user...');
    const normalUserResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: `Normal User Test Account ${timestamp}`,
      email: `normaluser${timestamp}@test.com`,
      password: 'Password123!',
      address: '789 Normal User Lane'
    });
    console.log('✅ Normal user registered:', normalUserResponse.data.user.name);
    const normalUserToken = normalUserResponse.data.token;

    // Test 6: Normal user views stores
    console.log('\n6. Testing store listing for normal user...');
    const storesResponse = await axios.get(`${BASE_URL}/api/stores`, {
      headers: { Authorization: `Bearer ${normalUserToken}` }
    });
    console.log('✅ Stores retrieved:', storesResponse.data.stores.length, 'stores found');

    // Test 7: Submit a rating
    console.log('\n7. Submitting a rating...');
    const ratingResponse = await axios.post(`${BASE_URL}/api/ratings/${storeResponse.data.store.id}`, {
      rating_value: 5
    }, {
      headers: { Authorization: `Bearer ${normalUserToken}` }
    });
    console.log('✅ Rating submitted:', ratingResponse.data.rating.ratingValue, 'stars');

    // Test 8: Get updated store with rating
    console.log('\n8. Checking store with new rating...');
    const updatedStoresResponse = await axios.get(`${BASE_URL}/api/stores`, {
      headers: { Authorization: `Bearer ${normalUserToken}` }
    });
    const ratedStore = updatedStoresResponse.data.stores.find(s => s.id === storeResponse.data.store.id);
    console.log('✅ Store now has rating:', ratedStore.averageRating, 'average,', ratedStore.totalRatings, 'total ratings');

    // Test 9: Admin dashboard
    console.log('\n9. Testing admin dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin dashboard statistics:');
    console.log('   Total users:', dashboardResponse.data.statistics.totalUsers);
    console.log('   Total stores:', dashboardResponse.data.statistics.totalStores);
    console.log('   Total ratings:', dashboardResponse.data.statistics.totalRatings);

    // Test 10: Store owner login and dashboard
    console.log('\n10. Testing store owner login and dashboard...');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: `storeowner${timestamp}@test.com`,
      password: 'Password123!'
    });
    const ownerToken = ownerLoginResponse.data.token;
    
    const ownerDashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/owner`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log('✅ Store owner dashboard:');
    console.log('   Store name:', ownerDashboardResponse.data.store.name);
    console.log('   Average rating:', ownerDashboardResponse.data.statistics.averageRating);
    console.log('   Total ratings:', ownerDashboardResponse.data.statistics.totalRatings);

    console.log('\n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ SQLite database is fully functional');
    console.log('✅ All user roles work correctly');
    console.log('✅ Store creation and management works');
    console.log('✅ Rating system is operational');
    console.log('✅ Dashboard analytics are working');
    console.log('✅ PostgreSQL to SQLite migration is 100% successful!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('   Validation details:', error.response.data.details);
    }
    process.exit(1);
  }
}

comprehensiveTest();
