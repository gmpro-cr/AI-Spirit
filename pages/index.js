import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  const handleStartChatting = () => {
    if (user) {
      router.push('/personas')
    } else {
      router.push('/auth/signin?returnTo=/personas')
    }
  }

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <>
      <Head>
        <title>AI-Spirit - Talk to Legends</title>
        <meta name="description" content="Engage in enlightening conversations with AI-powered personas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex flex-col h-screen bg-white text-black">
        {/* Header */}
        <header className="p-4 border-b border-gray-200">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">AI-Spirit</h1>
            {!user && (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={() => router.push('/personas')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Personas
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-4">Talk to Legends</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            Engage in enlightening conversations with AI-powered personas of the world&apos;s greatest minds.
            History, innovation, and wisdom are just a message away.
          </p>
        </main>

        {/* Footer with CTA */}
        <footer className="p-8">
          <div className="container mx-auto flex justify-center">
            <button
              onClick={handleStartChatting}
              className="bg-black text-white text-lg font-semibold px-12 py-4 rounded-full hover:bg-gray-800 transition-transform hover:scale-105"
            >
              Start Chatting
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}
