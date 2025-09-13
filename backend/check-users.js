const axios = require('axios');

async function checkUsers() {
  try {
    console.log('🔍 Checking User Database...\n');

    // Get admin token first
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');

    // Get all users
    const usersResponse = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('\n📋 Users in database:');
    usersResponse.data.users.forEach(user => {
      console.log(`   ${user.email} - ${user.role} - ${user.name}`);
    });

    // Try to create normal user if it doesn't exist
    const normalUserExists = usersResponse.data.users.find(u => u.email === 'user@example.com');
    
    if (!normalUserExists) {
      console.log('\n🔧 Creating normal user...');
      const createUserResponse = await axios.post('http://localhost:5000/api/users', {
        name: 'Normal User Test Account',
        email: 'user@example.com',
        password: 'user123',
        address: '456 User Street',
        role: 'Normal User'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Normal user created');
    }

    // Try to create store owner if it doesn't exist
    const storeOwnerExists = usersResponse.data.users.find(u => u.email === 'owner@example.com');
    
    if (!storeOwnerExists) {
      console.log('\n🔧 Creating store owner...');
      const createOwnerResponse = await axios.post('http://localhost:5000/api/users', {
        name: 'Store Owner Test Account',
        email: 'owner@example.com',
        password: 'owner123',
        address: '789 Owner Street',
        role: 'Store Owner'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Store owner created');
    }

    // Test normal user login
    console.log('\n🧪 Testing normal user login...');
    try {
      const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'user@example.com',
        password: 'user123'
      });
      console.log('✅ Normal user login successful');
    } catch (error) {
      console.error('❌ Normal user login failed:', error.response?.data || error.message);
    }

    // Test store owner login
    console.log('\n🧪 Testing store owner login...');
    try {
      const ownerLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'owner@example.com',
        password: 'owner123'
      });
      console.log('✅ Store owner login successful');
    } catch (error) {
      console.error('❌ Store owner login failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.response?.data || error.message);
  }
}

checkUsers();
