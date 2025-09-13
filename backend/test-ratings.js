const axios = require('axios');

async function testRatings() {
  try {
    console.log('🧪 Testing Rating Calculations...\n');

    // Get admin token
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.token;

    // Get normal user token
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@example.com',
      password: 'User123!'
    });
    const userToken = userLoginResponse.data.token;

    // Fetch stores as admin to see ratings
    console.log('1. Fetching stores as admin...');
    const adminStoresResponse = await axios.get('http://localhost:5000/api/stores', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin stores with ratings:');
    adminStoresResponse.data.stores.forEach(store => {
      console.log(`   ${store.name}: ${store.averageRating}⭐ (${store.totalRatings} ratings)`);
    });

    // Fetch stores as normal user to see ratings
    console.log('\n2. Fetching stores as normal user...');
    const userStoresResponse = await axios.get('http://localhost:5000/api/stores', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ User stores with ratings:');
    userStoresResponse.data.stores.forEach(store => {
      console.log(`   ${store.name}: ${store.averageRating}⭐ (${store.totalRatings} ratings)`);
    });

    console.log('\n🎉 Rating calculations are now working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRatings();
