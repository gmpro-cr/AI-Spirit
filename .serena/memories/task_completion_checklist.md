# Task Completion Checklist

When a development task is completed, follow these steps:

## 1. Code Quality Checks
```bash
# Run ESLint to check for issues
npm run lint

# Fix any linting errors
npm run lint -- --fix
```

## 2. Local Testing
```bash
# Ensure dev server runs without errors
npm run dev

# Test the specific feature/change in browser at http://localhost:3000
# Check console for errors
# Test on mobile viewport (responsive design)
```

## 3. Build Verification
```bash
# Ensure production build succeeds
npm run build

# If build fails, fix TypeScript/ESLint errors
```

## 4. Database Changes
If the task involved database changes:
- Update schema in `supabase/schema.sql`
- Create migration file in `supabase/migration-*.sql`
- Test migration in Supabase dashboard
- Update seed data if needed in `supabase/seed.sql`

## 5. Environment Variables
If new environment variables were added:
- Update `.env.example` with placeholder values
- Document in README.md if needed
- Ensure production environment (Vercel) has the variables set

## 6. Testing
If the change is significant:
- Run relevant Python test files
- Consider writing new tests if needed
```bash
python3 test_chat_functionality.py
python3 test_personas_page.py
```

## 7. Git Workflow
```bash
# Check what changed
git status
git diff

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: description of change"

# Push to remote
git push
```

## 8. Documentation
- Update README.md if needed
- Update setup documentation if configuration changed
- Add inline comments for complex logic

## 9. Deployment
- Push to main branch (auto-deploys to Vercel)
- Monitor deployment in Vercel dashboard
- Check production site for errors
- Test the feature in production

## 10. Final Verification
- Feature works as expected ✓
- No console errors ✓
- Responsive design intact ✓
- Build succeeds ✓
- ESLint passes ✓