import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </ChatProvider>
    </AuthProvider>
  )
}
