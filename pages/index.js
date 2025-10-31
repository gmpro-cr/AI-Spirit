import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'

export default function Home() {
  return (
    <>
      <Head>
        <title>Esperit.AI - Chat with Anyone, Real or Imagined</title>
        <meta name="description" content="Conversational AI platform with 45+ personas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ParticlesBackground />
      <Navbar />

      <main className="relative min-h-screen bg-gradient-dark pt-24 pb-16 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Chat with{' '}
              <span className="text-white">
                Anyone
              </span>
              <br />
              Real or Imagined
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Engage with AI-powered personas - from business icons to historical figures,
              celebrities to fictional characters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personas" className="btn-gradient text-lg px-8 py-4">
                Start Chatting (Guest)
              </Link>
              <Link href="/auth/signin" className="btn-outline text-lg px-8 py-4">
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-panel p-8">
              <div className="text-3xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-2">45+ Personas</h3>
              <p className="text-text-secondary">
                From Elon Musk to Swami Vivekananda, Shah Rukh Khan to Tenali Raman
              </p>
            </div>
            <div className="glass-panel p-8">
              <div className="text-3xl mb-4">🌏</div>
              <h3 className="text-xl font-semibold mb-2">Multilingual</h3>
              <p className="text-text-secondary">
                Seamless conversations in English, Hindi, and Hinglish
              </p>
            </div>
            <div className="glass-panel p-8">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Safe & Private</h3>
              <p className="text-text-secondary">
                Multi-layer moderation and secure conversations
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-text-muted text-sm">
            AI-generated responses for entertainment and educational purposes
          </div>
        </div>
      </main>
    </>
  )
}
