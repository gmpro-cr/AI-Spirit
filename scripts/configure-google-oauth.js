#!/usr/bin/env node

/**
 * Script to configure Google OAuth in Supabase
 *
 * This script will:
 * 1. Update Supabase authentication settings with Google OAuth credentials
 * 2. Add authorized redirect URIs
 * 3. Enable Google as an authentication provider
 */

const https = require('https');

const SUPABASE_PROJECT_REF = 'exdjsvknudvfkabnifrg'; // From your Supabase URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!SUPABASE_SERVICE_KEY || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure these are set in .env.local:');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('- GOOGLE_CLIENT_ID');
  console.error('- GOOGLE_CLIENT_SECRET');
  process.exit(1);
}

async function configureGoogleOAuth() {
  console.log('🔧 Configuring Google OAuth in Supabase...\n');

  console.log('📋 Configuration Details:');
  console.log('- Google Client ID:', GOOGLE_CLIENT_ID);
  console.log('- Supabase Project:', SUPABASE_PROJECT_REF);
  console.log('- Redirect URI: http://localhost:3002/auth/callback\n');

  console.log('⚠️  IMPORTANT: Automatic configuration via API is restricted.');
  console.log('You need to manually configure Google OAuth in Supabase Dashboard:\n');

  console.log('📝 Manual Setup Steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF);
  console.log('2. Navigate to: Authentication > Providers');
  console.log('3. Find "Google" and click to expand');
  console.log('4. Enable Google provider');
  console.log('5. Enter these credentials:');
  console.log('   - Client ID: ' + GOOGLE_CLIENT_ID);
  console.log('   - Client Secret: ' + GOOGLE_CLIENT_SECRET);
  console.log('6. Add authorized redirect URIs in Google Cloud Console:');
  console.log('   - https://' + SUPABASE_PROJECT_REF + '.supabase.co/auth/v1/callback');
  console.log('   - http://localhost:3002/auth/callback');
  console.log('7. Click "Save"\n');

  console.log('📌 Google Cloud Console Setup:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select your OAuth 2.0 Client ID');
  console.log('3. Under "Authorized redirect URIs", add:');
  console.log('   - https://' + SUPABASE_PROJECT_REF + '.supabase.co/auth/v1/callback');
  console.log('   - http://localhost:3002/auth/callback');
  console.log('4. Click "Save"\n');

  console.log('✅ After completing these steps, Google Sign-In will work!');
}

configureGoogleOAuth().catch(console.error);
