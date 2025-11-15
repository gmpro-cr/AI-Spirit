# Database Backup Guide - Supabase

## Overview

This guide covers configuring automated backups for your Supabase PostgreSQL database to ensure data safety and enable disaster recovery.

---

## Backup Strategy

### Supabase Free Tier Limitations

**Important**: The Supabase **free tier does NOT include automated backups**.

Your options:
1. **Upgrade to Supabase Pro** ($25/month) - Includes daily automated backups
2. **Manual backup script** (Free) - Run periodically via cron job or GitHub Actions
3. **Hybrid approach** - Manual backups until revenue justifies Pro tier

---

## Option 1: Supabase Pro (Recommended for Production)

### Benefits
- ✅ **Daily automated backups** (retained for 7 days)
- ✅ **Point-in-time recovery** (PITR) up to 7 days back
- ✅ **One-click restore** from dashboard
- ✅ **8 GB database storage** (vs 500 MB free)
- ✅ **Better performance** and support

### Setup Steps

1. **Upgrade to Pro Tier**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Click "Settings" → "Billing"
   - Click "Upgrade to Pro"
   - Confirm $25/month subscription

2. **Enable Backups**:
   - Go to "Settings" → "Database"
   - Scroll to "Backups" section
   - Verify "Daily backups" is enabled (should be automatic)
   - Set backup retention period (default: 7 days)

3. **Test Restore Process**:
   - Go to "Database" → "Backups"
   - Select a recent backup
   - Click "Restore" to test process
   - **WARNING**: This will overwrite current data (test on staging first!)

### Cost Analysis

**Supabase Pro**: $25/month
- Includes: Daily backups, 8 GB storage, 250 GB bandwidth, better support
- **Worth it when**: 
  - You have > 100 active users
  - Revenue > $100/month
  - Database > 400 MB

---

## Option 2: Manual Backup Script (Zero Cost)

### Overview

Create a backup script that exports the entire database to SQL files and stores them securely.

### Setup Instructions

#### Step 1: Create Backup Script

Create `scripts/backup-database.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)[1]

// Backup configuration
const BACKUP_DIR = path.join(process.cwd(), 'backups')
const MAX_BACKUPS = 7 // Keep last 7 backups

async function createBackup() {
  console.log('[Backup] Starting database backup...')
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.sql`
  const filepath = path.join(BACKUP_DIR, filename)

  try {
    // Method 1: Use pg_dump (requires PostgreSQL client installed)
    const dbUrl = `postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`
    
    await execPromise(`pg_dump "${dbUrl}" > "${filepath}"`)
    
    console.log('[Backup] ✅ Database backed up successfully!')
    console.log(`[Backup] File: ${filepath}`)
    console.log(`[Backup] Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`)

    // Clean up old backups
    await cleanupOldBackups()

    return filepath
  } catch (error) {
    console.error('[Backup] ❌ Backup failed:', error.message)
    
    // Fallback: Manual data export
    console.log('[Backup] Trying fallback method (manual export)...')
    await fallbackBackup(filepath)
  }
}

async function fallbackBackup(filepath) {
  // If pg_dump is not available, export data manually
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const tables = ['users', 'personas', 'conversations', 'messages']
  let sqlDump = `-- Database Backup: ${new Date().toISOString()}\n\n`

  for (const table of tables) {
    console.log(`[Backup] Exporting table: ${table}`)
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
    
    if (error) {
      console.error(`[Backup] Error exporting ${table}:`, error)
      continue
    }

    // Convert to SQL INSERT statements
    if (data && data.length > 0) {
      sqlDump += `-- Table: ${table}\n`
      sqlDump += `DELETE FROM ${table};\n`
      
      data.forEach(row => {
        const columns = Object.keys(row).join(', ')
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : 
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : 
          typeof v === 'boolean' ? v : 
          typeof v === 'object' ? `'${JSON.stringify(v).replace(/'/g, "''")}'` :
          v
        ).join(', ')
        
        sqlDump += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`
      })
      
      sqlDump += '\n'
    }
  }

  fs.writeFileSync(filepath, sqlDump, 'utf8')
  console.log('[Backup] ✅ Fallback backup completed!')
  console.log(`[Backup] File: ${filepath}`)
}

async function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)

  if (files.length > MAX_BACKUPS) {
    const toDelete = files.slice(MAX_BACKUPS)
    console.log(`[Backup] Cleaning up ${toDelete.length} old backups...`)
    
    toDelete.forEach(file => {
      fs.unlinkSync(file.path)
      console.log(`[Backup] Deleted: ${file.name}`)
    })
  }
}

// Run backup
createBackup()
  .then(() => {
    console.log('[Backup] Backup process completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('[Backup] Fatal error:', error)
    process.exit(1)
  })
```

#### Step 2: Add NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "backup": "node scripts/backup-database.js"
  }
}
```

#### Step 3: Get Database Password

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to "Settings" → "Database"
4. Scroll to "Connection string" section
5. Click "Show password" to reveal your database password
6. Copy the password

#### Step 4: Add to `.env.local`

```bash
# Database Backup
SUPABASE_DB_PASSWORD=your_database_password_here
```

#### Step 5: Install PostgreSQL Client (Optional)

For the best backup method (pg_dump), install PostgreSQL:

**macOS**:
```bash
brew install postgresql
```

**Ubuntu/Debian**:
```bash
sudo apt-get install postgresql-client
```

**Windows**:
Download from: https://www.postgresql.org/download/windows/

#### Step 6: Test Manual Backup

```bash
npm run backup
```

Expected output:
```
[Backup] Starting database backup...
[Backup] ✅ Database backed up successfully!
[Backup] File: /path/to/backups/backup-2025-01-15T10-30-00.sql
[Backup] Size: 127.45 KB
[Backup] Backup process completed!
```

#### Step 7: Verify Backup File

```bash
ls -lh backups/
cat backups/backup-*.sql | head -20
```

---

## Option 3: Automated Backups with GitHub Actions (Free)

### Overview

Run backup script automatically every day using GitHub Actions (completely free).

### Setup Instructions

#### Step 1: Create GitHub Action Workflow

Create `.github/workflows/database-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install @supabase/supabase-js

      - name: Run backup script
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: npm run backup

      - name: Upload backup to GitHub
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/*.sql
          retention-days: 30

      # Optional: Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
      # - name: Upload to S3
      #   uses: aws-actions/configure-aws-credentials@v1
      #   with:
      #     aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      #     aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      #     aws-region: us-east-1
      # - run: aws s3 cp backups/ s3://your-bucket/backups/ --recursive
```

#### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add these secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_DB_PASSWORD`

#### Step 3: Test GitHub Action

1. Go to "Actions" tab in GitHub
2. Select "Database Backup" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait for completion (should take 1-2 minutes)
5. Download backup artifact to verify

---

## Backup Verification Checklist

After setting up backups, verify they work:

- [ ] Manual backup script runs without errors
- [ ] Backup file is created in `backups/` directory
- [ ] Backup file contains actual data (not empty)
- [ ] Old backups are automatically cleaned up
- [ ] GitHub Action runs successfully (if using automation)
- [ ] Backup can be restored (test on staging database)

---

## Restore Procedures

### From Manual Backup (pg_dump format)

```bash
# 1. Find the backup file
ls -lh backups/

# 2. Restore using psql
psql "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres" < backups/backup-2025-01-15T10-30-00.sql
```

### From Fallback Backup (SQL INSERT format)

```bash
# 1. Copy SQL content
cat backups/backup-2025-01-15T10-30-00.sql

# 2. Go to Supabase Dashboard → SQL Editor
# 3. Paste and run the SQL content
```

### From Supabase Pro Automated Backup

1. Go to Supabase Dashboard
2. Click "Database" → "Backups"
3. Find the backup you want to restore
4. Click "Restore"
5. Confirm (this will overwrite current data!)

---

## Recommended Backup Schedule

| Users | Backup Frequency | Method | Cost |
|-------|-----------------|--------|------|
| 0-50 | Weekly manual | Script | $0 |
| 50-200 | Daily via GitHub Actions | Script + Actions | $0 |
| 200-500 | Daily automated | Supabase Pro | $25/mo |
| 500+ | Hourly + PITR | Supabase Pro + monitoring | $25/mo |

---

## Backup Security Best Practices

1. **Encrypt backups** before uploading to cloud storage
2. **Never commit backups** to git (add to `.gitignore`)
3. **Store database password** securely (use environment variables)
4. **Test restore process** regularly (monthly)
5. **Keep backups in multiple locations** (local + cloud)

---

## Cost Comparison

### Free Tier Strategy (0-200 users)
- Manual backups via GitHub Actions: **$0/month**
- Storage: GitHub Artifacts (free, 500 MB)
- Retention: 30 days

### Pro Tier Strategy (200+ users)
- Supabase Pro with automated backups: **$25/month**
- Storage: Included (8 GB)
- Retention: 7 days + point-in-time recovery

---

## Next Steps

1. **Choose your backup strategy** based on current user count
2. **Set up backup script** (Option 2 or 3)
3. **Test backup creation** manually
4. **Test restore process** on staging database
5. **Schedule regular verification** (monthly backup/restore test)
6. **Document recovery procedures** for your team

---

## Emergency Contacts

If disaster strikes and you need to restore:

1. **Check latest backup**: `ls -lh backups/` or GitHub Actions artifacts
2. **Review backup file**: Ensure it's not corrupted
3. **Restore to staging first**: Test before restoring to production
4. **Notify users**: If there will be downtime during restore

---

## Monitoring Backup Health

Add to your daily checklist:
- [ ] Verify last backup timestamp (should be < 24 hours old)
- [ ] Check backup file size (should be growing with data)
- [ ] Review backup logs for errors
- [ ] Test restore on staging monthly

---

## Backup Checklist

**Initial Setup** (30 minutes):
- [ ] Choose backup strategy (Pro vs Manual)
- [ ] Create backup script (if manual)
- [ ] Add to package.json
- [ ] Get database password
- [ ] Test manual backup
- [ ] Set up GitHub Actions (optional)
- [ ] Add to .gitignore: `backups/`

**Monthly Verification** (15 minutes):
- [ ] Run manual backup
- [ ] Check file integrity
- [ ] Test restore on staging
- [ ] Clean up old backups
- [ ] Update documentation

---

**You're now protected against data loss!** 🎉
