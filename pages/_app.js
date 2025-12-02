import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { DefaultSeo } from 'next-seo'
import SEO from '../next-seo.config'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </ChatProvider>
    </AuthProvider>
  )
}
