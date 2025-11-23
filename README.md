# AI-Spirit

Conversational AI platform enabling users to engage with AI-driven personas - from business icons to historical figures, celebrities to fictional characters.

**Live at: [ai-spirit.in](https://ai-spirit.in)**

## Tech Stack

- **Frontend + Backend**: Next.js 14 (Pages Router)
- **Database + Auth**: Supabase
- **AI**: Google Gemini 1.5 Flash (with Groq Llama 3.3 70B fallback)
- **Styling**: Tailwind CSS (Dark Theme)
- **Deployment**: Vercel

## Features

- 20+ pre-built personas across 6 categories (Business, Entertainment, Spirituality, Fitness, Lifestyle, Historical)
- Custom persona creation
- Text-based chat with natural language AI
- Google OAuth + Email/Password authentication
- Guest mode for trying without signup
- Conversational responses (short, natural)
- Persona-specific personalities (each stays in character)
- Multilingual support (English, Hindi, Hinglish)
- Content moderation with multiple safety layers
- Response caching for improved performance
- Cost tracking and monitoring
- Dark theme with glassmorphism design
- Mobile responsive

## Personas

Categories include:
- **Business**: Elon Musk, Warren Buffett, Naval Ravikant
- **Entertainment**: Shah Rukh Khan, Taylor Swift, Joe Rogan
- **Spirituality**: Osho, Sadhguru, Ram Dass
- **Fitness**: David Goggins, Arnold Schwarzenegger
- **Lifestyle**: Gordon Ramsay, Marie Kondo
- **Historical**: Marcus Aurelius, Chanakya, Cleopatra

## Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key
- Groq API key (optional, for fallback)

### Installation

1. Clone the repository
```bash
git clone https://github.com/gmpro-cr/AI-Spirit.git
cd AI-Spirit
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

Required credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase project settings
- `GEMINI_API_KEY`: From Google AI Studio
- `GROQ_API_KEY`: From Groq Console (optional fallback)

4. Set up Supabase database

Run the SQL scripts in Supabase SQL Editor:
- `supabase/schema.sql` (creates tables and RLS policies)

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

The site auto-deploys on push to main branch.

## Project Structure

```
AI-Spirit/
├── components/       # React components
│   ├── chat/        # Chat interface components
│   ├── personas/    # Persona-related components
│   ├── layout/      # Layout components (Navbar, etc.)
│   └── auth/        # Auth components
├── context/         # React Context providers
├── data/            # Static data (personas)
├── lib/             # Utilities (Supabase, Gemini, Groq, moderation)
├── pages/           # Next.js pages
│   ├── api/        # API routes
│   ├── auth/       # Auth pages
│   ├── chat/       # Chat pages
│   └── personas/   # Persona library
├── public/          # Static files
├── styles/          # Global styles
└── supabase/        # Database schema
```

## API Endpoints

- `POST /api/chat` - Send message to persona
- `GET /api/personas` - List all personas
- `POST /api/personas/create` - Create custom persona
- `POST /api/contact` - Contact form submission
- `POST /api/user/delete-account` - GDPR account deletion

## License

MIT
