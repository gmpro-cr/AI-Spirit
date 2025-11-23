/**
 * Custom Google OAuth Callback Handler
 *
 * This bypasses Supabase's OAuth flow to use our domain as redirect_uri,
 * so Google shows "ai-spirit.in" instead of Supabase URL on consent screen.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, error: oauthError } = req.query

  if (oauthError) {
    console.error('OAuth error:', oauthError)
    return res.redirect('/?error=oauth_error')
  }

  if (!code) {
    return res.redirect('/?error=no_code')
  }

  try {
    // Exchange code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://www.ai-spirit.in/api/auth/google-callback',
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token exchange error:', tokens)
      return res.redirect('/?error=token_exchange')
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    if (!userInfo.email) {
      console.error('No email in user info:', userInfo)
      return res.redirect('/?error=no_email')
    }

    // Sign in or create user with Supabase using the ID token
    const { data, error } = await supabaseAdmin.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
      access_token: tokens.access_token,
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return res.redirect('/?error=auth_failed')
    }

    // Set the session cookie
    // We need to pass the session to the client
    // Redirect with session info in URL (will be picked up by client)
    const redirectUrl = new URL('/auth/callback', 'https://www.ai-spirit.in')
    redirectUrl.searchParams.set('access_token', data.session.access_token)
    redirectUrl.searchParams.set('refresh_token', data.session.refresh_token)
    redirectUrl.searchParams.set('returnTo', '/personas')

    return res.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('OAuth callback error:', error)
    return res.redirect('/?error=callback_failed')
  }
}
