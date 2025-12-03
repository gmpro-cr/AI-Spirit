#!/usr/bin/env node

/**
 * Test Razorpay API with exact same credentials as Vercel
 */

const https = require('https');

const keyId = 'rzp_live_RnCOjpYVSDEHhT';
const keySecret = 'fZUaV0GlcApszlOHVrJi3UVO';

console.log('🧪 Testing Razorpay API Authentication\n');
console.log('Key ID:', keyId);
console.log('Key Secret:', keySecret.substring(0, 10) + '...');
console.log('');

// Test 1: Create customer via direct API call
const customerData = JSON.stringify({
  name: 'Test User ' + Date.now(),
  email: 'test' + Date.now() + '@example.com',
  contact: ''
});

const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

const options = {
  hostname: 'api.razorpay.com',
  port: 443,
  path: '/v1/customers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': customerData.length,
    'Authorization': `Basic ${auth}`
  }
};

console.log('Making direct API call to Razorpay...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('');
    console.log('Response Body:');
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCCESS! Customer created with ID:', parsed.id);
      } else {
        console.log('\n❌ FAILED!');
        console.log('Error Code:', parsed.error?.code);
        console.log('Error Description:', parsed.error?.description);
        
        if (res.statusCode === 401) {
          console.log('\n🚨 AUTHENTICATION FAILED!');
          console.log('The credentials are INVALID or EXPIRED');
          console.log('Please check:');
          console.log('1. Razorpay Dashboard for correct credentials');
          console.log('2. Make sure using LIVE credentials if in live mode');
          console.log('3. Make sure using TEST credentials if in test mode');
        }
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network error:', error.message);
});

req.write(customerData);
req.end();
