/**
 * Database Cleanup Script
 * 
 * Removes old data to prevent database bloat and stay within free tier limits
 * Deletes:
 * - Guest conversations older than 7 days
 * - User conversations older than 90 days (if inactive)
 * - Orphaned messages (no conversation)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Cleanup] ❌ Missing required environment variables!')
  console.error('[Cleanup] Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Cleanup configuration
const CLEANUP_CONFIG = {
  // Delete guest conversations older than this many days
  guestConversationRetentionDays: 7,
  
  // Delete inactive user conversations older than this many days
  userConversationRetentionDays: 90,
  
  // Delete messages with no conversation
  deleteOrphanedMessages: true,
  
  // Dry run mode (don't actually delete, just report)
  dryRun: false,
}

const stats = {
  guestConversationsDeleted: 0,
  oldConversationsDeleted: 0,
  messagesDeleted: 0,
  orphanedMessagesDeleted: 0,
  bytesFreed: 0,
}

/**
 * Delete old guest conversations
 */
async function cleanupGuestConversations() {
  console.log(`\n[Cleanup] Checking guest conversations older than ${CLEANUP_CONFIG.guestConversationRetentionDays} days...`)
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.guestConversationRetentionDays)
  const cutoffISO = cutoffDate.toISOString()

  try {
    // Find guest conversations to delete
    const { data: conversations, error: findError } = await supabase
      .from('conversations')
      .select('id, created_at, title')
      .is('user_id', null) // Guest conversations have null user_id
      .lt('created_at', cutoffISO)

    if (findError) throw findError

    if (!conversations || conversations.length === 0) {
      console.log('[Cleanup] ℹ️ No old guest conversations found')
      return
    }

    console.log(`[Cleanup] Found ${conversations.length} old guest conversations`)

    if (CLEANUP_CONFIG.dryRun) {
      console.log('[Cleanup] 🔍 DRY RUN - Would delete:')
      conversations.forEach(c => {
        console.log(`  - ${c.id}: ${c.title || 'Untitled'} (${c.created_at})`)
      })
      return
    }

    // Delete messages first (foreign key constraint)
    const conversationIds = conversations.map(c => c.id)
    
    const { error: messagesError, count: messagesCount } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .in('conversation_id', conversationIds)

    if (messagesError) throw messagesError
    stats.messagesDeleted += messagesCount || 0

    // Delete conversations
    const { error: deleteError, count: conversationsCount } = await supabase
      .from('conversations')
      .delete({ count: 'exact' })
      .in('id', conversationIds)

    if (deleteError) throw deleteError
    stats.guestConversationsDeleted = conversationsCount || 0

    console.log(`[Cleanup] ✅ Deleted ${conversationsCount} guest conversations and ${messagesCount} messages`)

  } catch (error) {
    console.error('[Cleanup] ❌ Error cleaning up guest conversations:', error.message)
  }
}

/**
 * Delete old inactive user conversations
 */
async function cleanupOldUserConversations() {
  console.log(`\n[Cleanup] Checking user conversations older than ${CLEANUP_CONFIG.userConversationRetentionDays} days...`)
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.userConversationRetentionDays)
  const cutoffISO = cutoffDate.toISOString()

  try {
    // Find old user conversations with no recent activity
    const { data: conversations, error: findError } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at, title, user_id')
      .not('user_id', 'is', null) // Only user conversations
      .lt('updated_at', cutoffISO)

    if (findError) throw findError

    if (!conversations || conversations.length === 0) {
      console.log('[Cleanup] ℹ️ No old user conversations found')
      return
    }

    console.log(`[Cleanup] Found ${conversations.length} old user conversations`)

    if (CLEANUP_CONFIG.dryRun) {
      console.log('[Cleanup] 🔍 DRY RUN - Would delete:')
      conversations.forEach(c => {
        console.log(`  - ${c.id}: ${c.title || 'Untitled'} (last active: ${c.updated_at})`)
      })
      return
    }

    // Delete messages first
    const conversationIds = conversations.map(c => c.id)
    
    const { error: messagesError, count: messagesCount } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .in('conversation_id', conversationIds)

    if (messagesError) throw messagesError
    stats.messagesDeleted += messagesCount || 0

    // Delete conversations
    const { error: deleteError, count: conversationsCount } = await supabase
      .from('conversations')
      .delete({ count: 'exact' })
      .in('id', conversationIds)

    if (deleteError) throw deleteError
    stats.oldConversationsDeleted = conversationsCount || 0

    console.log(`[Cleanup] ✅ Deleted ${conversationsCount} old user conversations and ${messagesCount} messages`)

  } catch (error) {
    console.error('[Cleanup] ❌ Error cleaning up old user conversations:', error.message)
  }
}

/**
 * Delete orphaned messages (messages with no conversation)
 */
async function cleanupOrphanedMessages() {
  if (!CLEANUP_CONFIG.deleteOrphanedMessages) {
    return
  }

  console.log('\n[Cleanup] Checking for orphaned messages...')

  try {
    // Find all conversation IDs
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')

    if (conversationsError) throw conversationsError

    const validConversationIds = conversations.map(c => c.id)

    // Find messages with invalid conversation_id
    const { data: orphanedMessages, error: findError } = await supabase
      .from('messages')
      .select('id, conversation_id, created_at')
      .not('conversation_id', 'in', `(${validConversationIds.join(',')})`)

    if (findError) throw findError

    if (!orphanedMessages || orphanedMessages.length === 0) {
      console.log('[Cleanup] ℹ️ No orphaned messages found')
      return
    }

    console.log(`[Cleanup] Found ${orphanedMessages.length} orphaned messages`)

    if (CLEANUP_CONFIG.dryRun) {
      console.log('[Cleanup] 🔍 DRY RUN - Would delete:')
      orphanedMessages.forEach(m => {
        console.log(`  - Message ${m.id} (conversation: ${m.conversation_id})`)
      })
      return
    }

    // Delete orphaned messages
    const orphanedIds = orphanedMessages.map(m => m.id)
    
    const { error: deleteError, count } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .in('id', orphanedIds)

    if (deleteError) throw deleteError
    stats.orphanedMessagesDeleted = count || 0

    console.log(`[Cleanup] ✅ Deleted ${count} orphaned messages`)

  } catch (error) {
    console.error('[Cleanup] ❌ Error cleaning up orphaned messages:', error.message)
  }
}

/**
 * Estimate database size
 */
async function getDatabaseSize() {
  try {
    // Count records in each table
    const tables = ['users', 'personas', 'conversations', 'messages']
    const sizes = {}

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`[Cleanup] Error counting ${table}:`, error.message)
        sizes[table] = 0
      } else {
        sizes[table] = count
      }
    }

    return sizes
  } catch (error) {
    console.error('[Cleanup] Error getting database size:', error.message)
    return {}
  }
}

/**
 * Print cleanup summary
 */
function printSummary(sizeBefore, sizeAfter) {
  console.log('\n' + '='.repeat(60))
  console.log('DATABASE CLEANUP SUMMARY')
  console.log('='.repeat(60))
  
  console.log('\n📊 Records Deleted:')
  console.log(`  Guest Conversations: ${stats.guestConversationsDeleted}`)
  console.log(`  Old User Conversations: ${stats.oldConversationsDeleted}`)
  console.log(`  Messages: ${stats.messagesDeleted}`)
  console.log(`  Orphaned Messages: ${stats.orphanedMessagesDeleted}`)
  
  const totalDeleted = 
    stats.guestConversationsDeleted + 
    stats.oldConversationsDeleted + 
    stats.messagesDeleted + 
    stats.orphanedMessagesDeleted
  
  console.log(`\n  Total Records Deleted: ${totalDeleted}`)
  
  console.log('\n📈 Database Size:')
  console.log('  Before:')
  console.log(`    Users: ${sizeBefore.users || 0}`)
  console.log(`    Personas: ${sizeBefore.personas || 0}`)
  console.log(`    Conversations: ${sizeBefore.conversations || 0}`)
  console.log(`    Messages: ${sizeBefore.messages || 0}`)
  
  console.log('  After:')
  console.log(`    Users: ${sizeAfter.users || 0}`)
  console.log(`    Personas: ${sizeAfter.personas || 0}`)
  console.log(`    Conversations: ${sizeAfter.conversations || 0}`)
  console.log(`    Messages: ${sizeAfter.messages || 0}`)
  
  const conversationsSaved = (sizeBefore.conversations || 0) - (sizeAfter.conversations || 0)
  const messagesSaved = (sizeBefore.messages || 0) - (sizeAfter.messages || 0)
  
  console.log('\n💾 Storage Saved:')
  console.log(`  Conversations: ${conversationsSaved}`)
  console.log(`  Messages: ${messagesSaved}`)
  
  // Estimate storage saved (rough calculation)
  const avgMessageSize = 500 // bytes
  const avgConversationSize = 200 // bytes
  const estimatedBytes = (conversationsSaved * avgConversationSize) + (messagesSaved * avgMessageSize)
  const estimatedKB = (estimatedBytes / 1024).toFixed(2)
  const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(2)
  
  console.log(`  Estimated: ${estimatedKB} KB (${estimatedMB} MB)`)
  
  console.log('\n⚙️ Configuration:')
  console.log(`  Guest Retention: ${CLEANUP_CONFIG.guestConversationRetentionDays} days`)
  console.log(`  User Retention: ${CLEANUP_CONFIG.userConversationRetentionDays} days`)
  console.log(`  Delete Orphaned Messages: ${CLEANUP_CONFIG.deleteOrphanedMessages}`)
  console.log(`  Dry Run: ${CLEANUP_CONFIG.dryRun}`)
  
  console.log('\n' + '='.repeat(60))
  
  if (CLEANUP_CONFIG.dryRun) {
    console.log('\n🔍 This was a DRY RUN - no data was actually deleted')
    console.log('To perform the cleanup, set CLEANUP_CONFIG.dryRun = false')
  } else {
    console.log('\n✅ Cleanup completed successfully!')
  }
  
  console.log('\n')
}

/**
 * Main cleanup function
 */
async function runCleanup() {
  console.log('🧹 Starting Database Cleanup...\n')
  console.log('Configuration:')
  console.log(`  Guest Retention: ${CLEANUP_CONFIG.guestConversationRetentionDays} days`)
  console.log(`  User Retention: ${CLEANUP_CONFIG.userConversationRetentionDays} days`)
  console.log(`  Dry Run: ${CLEANUP_CONFIG.dryRun ? 'YES (no data will be deleted)' : 'NO'}`)
  
  // Get database size before cleanup
  const sizeBefore = await getDatabaseSize()
  
  // Run cleanup tasks
  await cleanupGuestConversations()
  await cleanupOldUserConversations()
  await cleanupOrphanedMessages()
  
  // Get database size after cleanup
  const sizeAfter = await getDatabaseSize()
  
  // Print summary
  printSummary(sizeBefore, sizeAfter)
}

// Parse command line arguments
const args = process.argv.slice(2)
if (args.includes('--dry-run')) {
  CLEANUP_CONFIG.dryRun = true
}
if (args.includes('--execute')) {
  CLEANUP_CONFIG.dryRun = false
}

// Run cleanup
runCleanup()
  .then(() => {
    console.log('✅ Database cleanup process completed!\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Database cleanup failed:', error)
    process.exit(1)
  })
