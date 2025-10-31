# Esperit.AI

Conversational AI platform enabling users to engage with AI-driven personas - from business icons to historical figures, celebrities to fictional characters.

## Tech Stack

- **Frontend + Backend**: Next.js 14 (Pages Router)
- **Database + Auth**: Supabase
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS (Dark Theme)
- **Deployment**: Vercel

## Features

- 10+ pre-built personas across 5 categories
- Text-based chat with natural language AI
- Google OAuth + Email/Password authentication
- Guest mode (10 messages/chat limit)
- Multilingual support (English, Hindi, Hinglish)
- Content moderation with multiple safety layers
- Dark theme with glassmorphism design

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd Esperit
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase project settings
- `GEMINI_API_KEY`: From Google AI Studio

4. Set up Supabase database

Run the SQL scripts in Supabase SQL Editor:
- `supabase/schema.sql` (creates tables and RLS policies)
- `supabase/seed.sql` (adds initial personas)

5. Configure Supabase Auth

In Supabase dashboard:
- Enable Google OAuth provider
- Add redirect URL: `http://localhost:3000/auth/callback`

6. Run development server
```bash
npm run dev
```

Visit http://localhost:3000

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase

Already configured - just ensure schema and seed data are applied.

## Project Structure

```
Esperit/
├── components/       # React components
│   ├── chat/        # Chat interface components
│   ├── personas/    # Persona-related components
│   ├── layout/      # Layout components (Navbar, etc.)
│   └── auth/        # Auth components
├── context/         # React Context providers
├── data/            # Static data (personas)
├── lib/             # Utilities (Supabase, Gemini, moderation)
├── pages/           # Next.js pages
│   ├── api/        # API routes
│   ├── auth/       # Auth pages
│   ├── chat/       # Chat pages
│   └── personas/   # Persona library
├── public/          # Static files
├── styles/          # Global styles
└── supabase/        # Database schema and seeds
```

## License

MIT
