# Code Style and Conventions

## File Structure
- Use `.jsx` for React components (not `.tsx`)
- Use `.js` for utility files and pages
- Components in `components/` organized by feature (chat, auth, layout, personas)
- API routes in `pages/api/`
- Utilities in `lib/`

## React/Next.js Conventions
- **Functional Components**: Use functional components with hooks
- **Export Style**: Use `export default function ComponentName()` for components
- **Props Destructuring**: Destructure props directly in function parameters
- **File Naming**: PascalCase for components (e.g., `MessageBubble.jsx`)

## Styling
- **Tailwind CSS**: Primary styling method
- **Design System**: Dark theme with glassmorphism effects
- **Responsive**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Animations**: Use Tailwind animation utilities (`animate-fadeIn`, etc.)
- **Colors**: Gradient-heavy with transparency and backdrop blur
- **Example Pattern**:
  ```jsx
  className="bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25"
  ```

## Code Organization
- **Components**: Single responsibility, focused components
- **API Routes**: Keep business logic in `/pages/api/` routes
- **Utilities**: Shared functions in `/lib/` (supabase.js, gemini.js, moderation.js)
- **Data**: Static data in `/data/`

## Naming Conventions
- **Variables**: camelCase (`isUser`, `chatHistory`)
- **Functions**: camelCase (`handleSubmit`, `fetchPersonas`)
- **Components**: PascalCase (`MessageBubble`, `ChatInterface`)
- **Files**: PascalCase for components, camelCase for utilities

## ESLint Configuration
- Uses Next.js core web vitals config
- Extends: `next/core-web-vitals`
- Run with `npm run lint`

## Best Practices
- Use Supabase client from `lib/supabase.js`
- Use Gemini client from `lib/gemini.js`
- Implement content moderation via `lib/moderation.js`
- Handle errors gracefully with try-catch
- Use environment variables for sensitive data