// Simple test script to verify OTP email system
const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 5000;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testOTPSystem() {
  console.log('\n🧪 Testing OTP Email System...\n');

  try {
    // Test 1: Register new user
    console.log('📝 Test 1: Registering new user...');
    const registerData = {
      name: 'OTP Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      phone: '1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'male'
    };

    const registerResponse = await makeRequest('POST', '/api/auth/register', registerData);
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registerResponse.data.userId}`);
      console.log(`   Message: ${registerResponse.data.message}`);
      console.log('\n💡 Check backend console for OTP (Development Mode)');
      console.log('   Look for: 🔐 DEVELOPMENT OTP for ...\n');
      
      // Wait a moment for console output
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Verify with test OTP
      console.log('📝 Test 2: Verifying with test OTP (123456)...');
      const verifyData = {
        email: registerData.email,
        otp: '123456'
      };
      
      const verifyResponse = await makeRequest('POST', '/api/auth/verify-otp', verifyData);
      
      if (verifyResponse.data.success) {
        console.log('✅ OTP verification successful!');
        console.log(`   Token: ${verifyResponse.data.token.substring(0, 20)}...`);
        console.log(`   User: ${verifyResponse.data.user.name}`);
        console.log(`   Role: ${verifyResponse.data.user.role}`);
        
        // Test 3: Login
        console.log('\n📝 Test 3: Testing login...');
        const loginData = {
          email: registerData.email,
          password: registerData.password
        };
        
        const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful!');
          console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
          
          console.log('\n🎉 All tests passed! OTP system is working correctly.\n');
        } else {
          console.log('❌ Login failed:', loginResponse.data.message);
        }
      } else {
        console.log('❌ OTP verification failed:', verifyResponse.data.message);
      }
    } else {
      console.log('❌ Registration failed:', registerResponse.data.message);
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Connection refused. Is the backend running?');
      console.error('   Run: cd backend && npm start');
    } else {
      console.error(`   ${error.message}`);
    }
    console.log('\n');
  }
}

// Run tests
testOTPSystem();
