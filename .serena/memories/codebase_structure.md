# Codebase Structure

## Directory Layout
```
esperit/
├── components/           # React components
│   ├── chat/            # Chat interface components
│   │   ├── ChatInterface.jsx
│   │   ├── MessageBubble.jsx
│   │   └── InputBox.jsx
│   ├── personas/        # Persona-related components
│   ├── layout/          # Layout components (Navbar, Footer, etc.)
│   └── auth/            # Authentication components
│
├── context/             # React Context providers
│
├── data/                # Static data (personas definitions)
│
├── lib/                 # Utility libraries
│   ├── supabase.js     # Supabase client
│   ├── gemini.js       # Gemini AI client
│   └── moderation.js   # Content moderation
│
├── pages/               # Next.js pages (Pages Router)
│   ├── api/            # API routes
│   ├── auth/           # Auth pages (signin, callback)
│   ├── chat/           # Chat pages
│   ├── personas/       # Persona library page
│   ├── index.js        # Homepage
│   ├── _app.js         # App wrapper
│   └── _document.js    # Document wrapper
│
├── public/              # Static assets (images, icons)
│
├── scripts/             # Utility scripts (migrations, fixes)
│
├── styles/              # Global CSS styles
│
├── supabase/            # Database schema and seeds
│   ├── schema.sql      # Table definitions & RLS policies
│   ├── seed.sql        # Initial persona data
│   └── migration-*.sql # Database migrations
│
└── test_*.py            # Python Playwright tests

```

## Key Files
- `package.json` - Dependencies and scripts
- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `.env.local` - Environment variables (not in git)
- `.env.example` - Environment variables template
- `jsconfig.json` - JavaScript module resolution
- `.eslintrc.json` - ESLint configuration

## Database Schema (Supabase)
- `profiles` - User profiles
- `personas` - Available AI personas
- `conversations` - Chat conversations
- `messages` - Individual chat messages
- `reports` - Content moderation reports

## API Routes Structure
Located in `pages/api/`:
- Authentication endpoints
- Chat endpoints
- Persona endpoints
- Moderation endpoints