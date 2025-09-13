const axios = require('axios');

async function createTestUsers() {
  try {
    console.log('🔧 Creating Test Users with Compliant Passwords...\n');

    // Get admin token
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');

    // Create normal user with compliant password
    console.log('\n1. Creating normal user...');
    try {
      const normalUserResponse = await axios.post('http://localhost:5000/api/users', {
        name: 'Normal User Test Account',
        email: 'user@example.com',
        password: 'User123!',
        address: '456 User Street, User City',
        role: 'Normal User'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Normal user created successfully');
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('✅ Normal user already exists');
      } else {
        console.error('❌ Normal user creation failed:', error.response?.data || error.message);
      }
    }

    // Create store owner with compliant password
    console.log('\n2. Creating store owner...');
    try {
      const storeOwnerResponse = await axios.post('http://localhost:5000/api/users', {
        name: 'Store Owner Test Account',
        email: 'owner@example.com',
        password: 'Owner123!',
        address: '789 Owner Street, Owner City',
        role: 'Store Owner'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Store owner created successfully');
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('✅ Store owner already exists');
      } else {
        console.error('❌ Store owner creation failed:', error.response?.data || error.message);
      }
    }

    // Test normal user login
    console.log('\n3. Testing normal user login...');
    try {
      const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'user@example.com',
        password: 'User123!'
      });
      console.log('✅ Normal user login successful');
      
      // Test stores fetch as normal user
      const userStoresResponse = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${userLoginResponse.data.token}` }
      });
      console.log('✅ Normal user can fetch stores:', userStoresResponse.data.stores.length, 'stores');
    } catch (error) {
      console.error('❌ Normal user login failed:', error.response?.data || error.message);
    }

    // Test store owner login
    console.log('\n4. Testing store owner login...');
    try {
      const ownerLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'owner@example.com',
        password: 'Owner123!'
      });
      console.log('✅ Store owner login successful');
      
      // Test stores fetch as store owner
      const ownerStoresResponse = await axios.get('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${ownerLoginResponse.data.token}` }
      });
      console.log('✅ Store owner can fetch stores:', ownerStoresResponse.data.stores.length, 'stores');
    } catch (error) {
      console.error('❌ Store owner login failed:', error.response?.data || error.message);
    }

    // Create a test store
    console.log('\n5. Creating test store...');
    try {
      const storeResponse = await axios.post('http://localhost:5000/api/stores', {
        name: 'Test Electronics Store',
        address: '123 Electronics Avenue, Tech City',
        owner_id: null
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Test store created:', storeResponse.data.store.name);
    } catch (error) {
      console.error('❌ Store creation failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 TEST USERS SETUP COMPLETE!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: user@example.com / User123!');
    console.log('   Owner: owner@example.com / Owner123!');

  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
  }
}

createTestUsers();
