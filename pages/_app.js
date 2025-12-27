import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { DefaultSeo } from 'next-seo'
import SEO from '../next-seo.config'
import ErrorBoundary from '@/components/ErrorBoundary'
import CookieConsentBanner from '@/components/common/CookieConsentBanner'
import { Crimson_Text } from 'next/font/google'

// Spiritual Minimalism - Display Font
const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <DefaultSeo {...SEO} />
          <div className={crimsonText.variable}>
            <Component {...pageProps} />
          </div>
          <CookieConsentBanner />
          <Analytics />
          <SpeedInsights />
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
