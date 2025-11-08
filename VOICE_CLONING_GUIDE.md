# Voice Cloning Guide for AI-Spirit Personas

## Overview
This guide explains how to clone authentic voices for each persona to make them sound realistic.

## Methods

### Method 1: Voice Cloning with Audio Samples
For personas where you have audio recordings:

1. **Collect Audio Samples**
   - Need 1-5 minutes of clear audio
   - Single speaker, minimal background noise
   - Conversational style works best

2. **Clone Voice via ElevenLabs Dashboard**
   - Go to [Voice Lab](https://elevenlabs.io/voice-lab)
   - Click "Add Instant Voice Clone"
   - Upload audio samples
   - Name it exactly as the persona (e.g., "Elon Musk")
   - Copy the voice ID

3. **Update Voice Mapping**
   - Add voice ID to `pages/api/tts.js` voiceMapping

### Method 2: Use Voice Library
Browse ElevenLabs Voice Library for matching voices:
- [Voice Library](https://elevenlabs.io/voice-library)
- Search for characteristics (deep, authoritative, British, etc.)
- Add voice to your account
- Copy voice ID and update mapping

## Audio Sources for Personas

### Real People (with public audio):
- **Elon Musk**: Interviews, podcasts, presentations
- **APJ Abdul Kalam**: Speeches, lectures
- **Mahatma Gandhi**: Historical recordings (if available)
- **Virat Kohli**: Interviews, press conferences
- **Shah Rukh Khan**: Movie dialogues, interviews

### Historical Figures (limited audio):
- Use voice actors reading their writings
- Or use archival recordings if available

### Fictional Characters:
- Use character voices from shows/movies
- Or hire voice actors

## Ethical Considerations
⚠️ Only clone voices for:
- Public figures with publicly available audio
- Educational/non-commercial purposes
- With proper attribution

## Voice ID Format
ElevenLabs voice IDs look like: `pNInz6obpgDQGcFmaJgB`

## Quick Start

1. Get audio sample (1-5 minutes)
2. Upload to ElevenLabs Voice Lab
3. Copy the voice ID
4. Update `pages/api/tts.js`:
   ```javascript
   'Persona Name': 'voice-id-here'
   ```
5. Test locally, then deploy

## Alternative: Instant Voice Cloning API

For programmatic voice cloning, use ElevenLabs API:
```javascript
POST https://api.elevenlabs.io/v1/voices/add
```

See: https://elevenlabs.io/docs/api-reference/add-voice
