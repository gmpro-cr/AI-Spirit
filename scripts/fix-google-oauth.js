#!/usr/bin/env node

/**
 * Fix Google OAuth by enabling it via Supabase Management API
 *
 * Unfortunately, Supabase's Management API requires a personal access token
 * that can only be obtained from the dashboard. The service role key won't work.
 *
 * This script will attempt to enable Google OAuth programmatically.
 */

const https = require('https');

const PROJECT_REF = 'exdjsvknudvfkabnifrg';
const GOOGLE_CLIENT_ID = '729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

console.log('==========================================');
console.log('Google OAuth Fix Script');
console.log('==========================================\n');

// Check for access token
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.log('❌ Missing SUPABASE_ACCESS_TOKEN\n');
  console.log('Unfortunately, I cannot enable Google OAuth automatically.');
  console.log('The Supabase Management API requires a personal access token.\n');
  console.log('Here\'s what you need to do:\n');
  console.log('Option 1: Get Access Token and Run Script');
  console.log('==========================================');
  console.log('1. Go to: https://supabase.com/dashboard/account/tokens');
  console.log('2. Click "Generate new token"');
  console.log('3. Give it a name (e.g., "Enable Google OAuth")');
  console.log('4. Copy the token');
  console.log('5. Run:');
  console.log('   export SUPABASE_ACCESS_TOKEN="your_token_here"');
  console.log('   node scripts/fix-google-oauth.js\n');
  console.log('Option 2: Manual Dashboard Configuration');
  console.log('==========================================');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + PROJECT_REF + '/auth/providers');
  console.log('2. Find "Google" and expand it');
  console.log('3. Toggle ON');
  console.log('4. Client ID: ' + GOOGLE_CLIENT_ID);
  console.log('5. Client Secret: ' + GOOGLE_CLIENT_SECRET);
  console.log('6. Click SAVE\n');
  process.exit(1);
}

console.log('✅ Access token found\n');
console.log('Updating Supabase auth configuration...\n');

const data = JSON.stringify({
  'EXTERNAL_GOOGLE_ENABLED': true,
  'EXTERNAL_GOOGLE_CLIENT_ID': GOOGLE_CLIENT_ID,
  'EXTERNAL_GOOGLE_SECRET': GOOGLE_CLIENT_SECRET,
  'EXTERNAL_GOOGLE_REDIRECT_URI': `https://${PROJECT_REF}.supabase.co/auth/v1/callback`
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_REF}/config/auth`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response body:', body);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ Successfully enabled Google OAuth!');
      console.log('\nWaiting 30 seconds for changes to propagate...');

      setTimeout(() => {
        console.log('\nVerifying configuration...\n');
        const { exec } = require('child_process');
        exec('bash scripts/verify-google-auth.sh', (error, stdout, stderr) => {
          console.log(stdout);
          if (error) {
            console.error(stderr);
          }
        });
      }, 30000);
    } else {
      console.log('\n❌ Failed to update configuration');
      console.log('Please try manual configuration via dashboard');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
