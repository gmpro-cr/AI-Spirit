-- Migration: Update Site URL and Redirect URLs for ai-spirit.in domain
-- Run this in Supabase SQL Editor

-- Update Site URL
UPDATE auth.config
SET value = '"https://ai-spirit.in"'
WHERE key = 'SITE_URL';

-- Update URI Allow List (Redirect URLs)
UPDATE auth.config
SET value = '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
WHERE key = 'URI_ALLOW_LIST';

-- If the keys don't exist, insert them
INSERT INTO auth.config (key, value)
SELECT 'SITE_URL', '"https://ai-spirit.in"'
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'SITE_URL');

INSERT INTO auth.config (key, value)
SELECT 'URI_ALLOW_LIST', '"https://ai-spirit.in/auth/callback,https://ai-spirit.in/**,https://esperit-ai.vercel.app/auth/callback,https://esperit-ai.vercel.app/**,http://localhost:3000/auth/callback,http://localhost:3000/**"'
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'URI_ALLOW_LIST');

-- Verify the changes
SELECT key, value FROM auth.config WHERE key IN ('SITE_URL', 'URI_ALLOW_LIST');
