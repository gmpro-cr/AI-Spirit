import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url)

    // Get parameters from query string
    const title = searchParams.get('title') || 'AI - Spirit'
    const description = searchParams.get('description') || 'Chat with AI personas for guidance and support'
    const personaName = searchParams.get('persona') || ''
    const avatarUrl = searchParams.get('avatar') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
            }}
          >
            {/* Avatar if provided */}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={personaName}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '100px',
                  marginBottom: '40px',
                  border: '8px solid white',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
              />
            )}

            {/* Title */}
            <div
              style={{
                fontSize: personaName ? '72px' : '96px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '30px',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '40px',
                color: 'rgba(255,255,255,0.95)',
                maxWidth: '900px',
                lineHeight: '1.4',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {description}
            </div>

            {/* Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '60px',
                fontSize: '32px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '600',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginRight: '15px' }}
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  fill="white"
                />
                <circle cx="12" cy="12" r="5" fill="white" />
              </svg>
              ai-spirit.in
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
