# ElevenLabs Voice Setup

AI-Spirit uses ElevenLabs API to provide realistic, natural-sounding voices for each persona. This document explains how to set it up.

## Why ElevenLabs?

- **Realistic Voices**: Far superior to browser TTS, sounds natural and human-like
- **Multilingual**: Supports English, Hindi, and many other languages
- **Expressive**: Can convey emotion and personality
- **Professional Quality**: Studio-quality voice synthesis

## Getting Your API Key

1. **Sign up for ElevenLabs**
   - Go to [ElevenLabs](https://elevenlabs.io/)
   - Create a free account (10,000 characters/month free tier)

2. **Get your API key**
   - Go to [Profile Settings](https://elevenlabs.io/app/settings/api-keys)
   - Copy your API key

3. **Add to your environment**
   - Copy `.env.example` to `.env.local`
   - Add your key: `ELEVENLABS_API_KEY=your_api_key_here`

## Voice Mappings

Each persona is mapped to a specific ElevenLabs voice that matches their characteristics:

### Pre-configured Voices

- **Adam** (deep, authoritative): Einstein, APJ Kalam, Sardar Patel, Swami Vivekananda
- **Bill** (calm, gentle): Gandhi, Osho, Krishnamurti, Ratan Tata, Tagore
- **Josh** (British, intellectual): Isaac Newton, Socrates, Nehru
- **Sam** (energetic): Virat Kohli, Shah Rukh Khan, Chhota Bheem
- **Antoni** (casual, witty): Elon Musk, Tenali Raman, Birbal
- **Bella** (female): PV Sindhu
- **Elli** (child-like): Shinchan

## Fallback Behavior

If the ElevenLabs API key is not configured or the API fails:
- The system automatically falls back to **Web Speech API** (browser native TTS)
- Voices will be less realistic but still functional
- No error shown to users, seamless transition

## Cost Considerations

### Free Tier (10,000 characters/month)
- Approximately 200-300 messages depending on length
- Perfect for testing and development
- Enough for moderate usage

### Paid Plans
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters

## Voice Customization

To customize voices for specific personas, edit `/pages/api/tts.js`:

```javascript
const voiceMapping = {
  'Your Persona Name': 'voice_id_from_elevenlabs',
  // ...
}
```

Available voices can be found in your ElevenLabs dashboard.

## Testing

1. Start your development server: `npm run dev`
2. Open any persona chat
3. Send a message and click the speaker icon
4. You should hear the persona speak in a realistic voice

## Troubleshooting

**No sound when clicking speaker button:**
- Check browser console for errors
- Verify API key is correct in `.env.local`
- Ensure you haven't exceeded your character limit
- Check browser allows audio autoplay

**Fallback to Web Speech API:**
- Check if `ELEVENLABS_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Check API key is valid on ElevenLabs dashboard

**Poor voice quality:**
- If using Web Speech API fallback, get an ElevenLabs key for better quality
- Some browsers have better TTS than others (Chrome recommended)

## Production Deployment

On Vercel/your hosting platform:
1. Go to project settings
2. Add environment variable: `ELEVENLABS_API_KEY`
3. Redeploy

The API key should never be exposed to the client - it's kept secure on the server side.
