#!/usr/bin/env node

/**
 * Manual script to reset message limit for a user
 * Usage: node scripts/reset-message-limit.js <user_email>
 */

import { supabaseAdmin } from '../lib/supabase.js'

const userEmail = process.argv[2]

if (!userEmail) {
  console.error('❌ Usage: node scripts/reset-message-limit.js <user_email>')
  process.exit(1)
}

async function resetMessageLimit() {
  try {
    // Get user by email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers()

    if (userError) {
      console.error('❌ Error fetching users:', userError)
      process.exit(1)
    }

    const targetUser = user.users.find(u => u.email === userEmail)

    if (!targetUser) {
      console.error(`❌ User not found with email: ${userEmail}`)
      process.exit(1)
    }

    console.log(`✓ Found user: ${targetUser.email} (ID: ${targetUser.id})`)

    // Get user's conversations
    const { data: conversations, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('user_id', targetUser.id)

    if (convError) {
      console.error('❌ Error fetching conversations:', convError)
      process.exit(1)
    }

    console.log(`✓ Found ${conversations?.length || 0} conversations`)

    if (!conversations || conversations.length === 0) {
      console.log('✓ No messages to reset - user has no conversations')
      process.exit(0)
    }

    const conversationIds = conversations.map(c => c.id)

    // Count messages today (UTC)
    const now = new Date()
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

    const { count: beforeCount } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('role', 'user')
      .gte('created_at', todayUTC.toISOString())

    console.log(`\n📊 Message count today (UTC): ${beforeCount || 0}/20`)
    console.log(`📅 UTC Date: ${todayUTC.toISOString()}`)
    console.log(`🕐 Current UTC Time: ${new Date().toISOString()}`)

    if (beforeCount === 0) {
      console.log('\n✓ User already has 0 messages today - no reset needed')
      process.exit(0)
    }

    console.log('\n⚠️  This script shows the current count.')
    console.log('⚠️  The limit will automatically reset at UTC midnight (00:00 UTC)')
    console.log('⚠️  If you are in IST (UTC+5:30), that is 5:30 AM IST')
    console.log('\nIf you need to manually delete messages, you can do so in the Supabase dashboard.')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

resetMessageLimit()
