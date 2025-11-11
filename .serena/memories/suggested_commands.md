# Suggested Commands for Esperit.AI

## Development
```bash
# Start development server
npm run dev

# Access at http://localhost:3000
```

## Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

## Database Setup
```bash
# Run Supabase schema (creates tables)
# Open https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg
# Go to SQL Editor and run supabase/schema.sql

# Run Supabase seed data (adds personas)
# In SQL Editor, run supabase/seed.sql
```

## Testing
```bash
# Python tests use Playwright
# Run individual test files:
python3 test_chat_functionality.py
python3 test_google_signin.py
python3 test_personas_page.py
python3 test_entire_website.py
```

## Useful macOS Commands
```bash
# List files
ls -la

# Search in files
grep -r "pattern" .

# Find files
find . -name "*.js"

# View git status
git status

# View git log
git log --oneline

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```