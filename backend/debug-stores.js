const axios = require('axios');

async function debugStores() {
  try {
    console.log('🔍 Debugging Store API Issues...\n');

    // Test 1: Admin login to get token
    console.log('1. Getting admin token...');
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin token obtained');

    // Test 2: Try to fetch stores as admin
    console.log('\n2. Fetching stores as admin...');
    try {
      const adminStoresResponse = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin stores fetch successful');
      console.log('   Stores found:', adminStoresResponse.data.stores?.length || 0);
    } catch (error) {
      console.error('❌ Admin stores fetch failed:', error.response?.data || error.message);
    }

    // Test 3: Normal user login
    console.log('\n3. Getting normal user token...');
    const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@example.com',
      password: 'user123'
    });
    const userToken = userLoginResponse.data.token;
    console.log('✅ User token obtained');

    // Test 4: Try to fetch stores as normal user
    console.log('\n4. Fetching stores as normal user...');
    try {
      const userStoresResponse = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ User stores fetch successful');
      console.log('   Stores found:', userStoresResponse.data.stores?.length || 0);
    } catch (error) {
      console.error('❌ User stores fetch failed:', error.response?.data || error.message);
    }

    // Test 5: Create a test store
    console.log('\n5. Creating a test store...');
    try {
      const storeResponse = await axios.post('http://localhost:5000/api/stores', {
        name: 'Debug Test Store',
        address: '123 Debug Street',
        owner_id: null
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Store creation successful:', storeResponse.data.store.name);
    } catch (error) {
      console.error('❌ Store creation failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugStores();
