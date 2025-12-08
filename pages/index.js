```javascript
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import ContactModal from '@/components/ContactModal'
import { INITIAL_PERSONAS } from '@/data/personas'

export default function Home() {
  const router = useRouter()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Get featured personas for the bento grid
  const featuredPersonas = [
    INITIAL_PERSONAS.find(p => p.slug === 'steve-jobs'),
    INITIAL_PERSONAS.find(p => p.slug === 'elon-musk'),
    INITIAL_PERSONAS.find(p => p.slug === 'osho'),
    INITIAL_PERSONAS.find(p => p.slug === 'parenting-coach'),
    INITIAL_PERSONAS.find(p => p.slug === 'mental-wellness-coach'),
    INITIAL_PERSONAS.find(p => p.slug === 'best-friend')
  ].filter(Boolean)

  const handleStartChatting = () => {
    router.push('/personas')
  }

  return (
    <>
      <Head>
        <title>AI-Spirit - AI Coaches for Parenting, Wellness, Relationships & More</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Talk to AI personas for guidance on parenting, mental wellness, relationships, and cooking. Get instant support from expert AI coaches. Free, available 24/7." />
        <meta name="keywords" content="AI chat, parenting advice, mental wellness, relationship counseling, cooking recipes, AI coach, parenting coach, wellness coach, Indian recipes, family advice" />
        <link rel="canonical" href="https://ai-spirit.in/" />
        <meta property="og:title" content="AI-Spirit - Your Personal AI Coach" />
        <meta property="og:description" content="Get instant guidance from AI experts on parenting, wellness, relationships, and cooking. Free to use, available 24/7." />
        <meta property="og:url" content="https://ai-spirit.in/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI-Spirit - AI Coaches for Parenting, Wellness & More" />
        <meta name="twitter:description" content="Talk to AI personas for parenting, wellness, relationships, and cooking advice." />
      </Head>

      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
        {/* Header - Apple Style (Blurry, Minimal) */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
          <div className="max-w-[980px] mx-auto px-4 md:px-6 h-12 flex justify-between items-center">
            <h1 className="text-lg font-semibold tracking-tight cursor-pointer hover:opacity-70 transition-opacity" onClick={() => router.push('/')}>
              AI-Spirit
            </h1>
            <nav className="flex items-center gap-6 text-xs md:text-sm font-medium text-gray-800">
              <button onClick={() => router.push('/personas')} className="hover:text-black hover:opacity-70 transition-all">Personas</button>
              <button onClick={() => router.push('/premium')} className="hover:text-black hover:opacity-70 transition-all">Premium</button>
              <button onClick={() => setIsContactModalOpen(true)} className="hover:text-black hover:opacity-70 transition-all">Support</button>
            </nav>
          </div>
        </header>

        <main className="pt-12">
          {/* Hero Section - Apple Style (Huge Type, Clean) */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-32 px-6 text-center bg-white">
            <div className="max-w-[980px] mx-auto animate-fade-in-up">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-black leading-tight">
               Your Personal AI Council.
              </h2>
              <p className="text-2xl md:text-3xl text-gray-500 font-medium tracking-tight mb-10 max-w-2xl mx-auto leading-relaxed">
                Wisdom from history's greatest minds. Guidance for life's daily challenges.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleStartChatting}
                  className="px-8 py-3 bg-[#0071e3] text-white text-base md:text-lg font-medium rounded-full hover:bg-[#0077ED] transition-colors shadow-sm"
                >
                  Start Chatting
                </button>
                <button
                  onClick={() => router.push('/premium')}
                  className="px-8 py-3 text-[#0071e3] text-base md:text-lg font-medium hover:underline transition-all flex items-center gap-1"
                >
                  Get Premium
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </section>

          {/* Bento Grid Showcase - Apple Style (Gray Background, Cards) */}
          <section className="py-24 bg-[#F5F5F7]">
            <div className="max-w-[980px] mx-auto px-6">
              <h3 className="text-3xl md:text-4xl font-bold text-black mb-12 tracking-tight text-center">
                Expertise for every moment.
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Large Featured Card */}
                <div className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-sm hover:scale-[1.01] transition-transform duration-500 flex flex-col justify-between h-[400px] relative overflow-hidden group cursor-pointer" onClick={() => router.push('/chat/steve-jobs')}>
                   <div className="z-10 relative">
                      <p className="text-gray-500 font-semibold mb-2 text-sm uppercase tracking-wide">Business & Vision</p>
                      <h4 className="text-3xl md:text-4xl font-bold text-black mb-2">Steve Jobs</h4>
                      <p className="text-gray-600 font-medium max-w-xs">"Innovation distinguishes between a leader and a follower."</p>
                   </div>
                   <div className="absolute right-[-20px] bottom-[-20px] md:right-[-40px] md:bottom-[-40px] w-64 h-64 md:w-80 md:h-80 opacity-90 transition-opacity group-hover:opacity-100">
                      <img src="/personas/steve-jobs.png" alt="Steve Jobs" className="w-full h-full object-cover rounded-full" />
                   </div>
                </div>

                {/* Tall Vertical Card */}
                <div className="row-span-2 bg-white rounded-3xl p-8 shadow-sm hover:scale-[1.01] transition-transform duration-500 flex flex-col h-[400px] md:h-auto relative overflow-hidden group cursor-pointer" onClick={() => router.push('/chat/osho')}>
                     <div className="z-10 relative h-full flex flex-col">
                        <p className="text-gray-500 font-semibold mb-2 text-sm uppercase tracking-wide">Spiritual</p>
                        <h4 className="text-3xl font-bold text-black mb-4">Osho</h4>
                        <p className="text-gray-600 font-medium mb-auto">Discover mindfulness and inner peace.</p>
                        <div className="mt-8 self-center w-48 h-48 rounded-full overflow-hidden shadow-lg">
                           <img src="/personas/osho.png" alt="Osho" className="w-full h-full object-cover" />
                        </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-2 sm:mb-3">Privacy First</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Your conversations are private. We respect your data and protect your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black text-center mb-8 sm:mb-12 md:mb-16">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">1</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Choose a Persona</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Browse our collection of legendary minds and pick who you want to talk to.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center -mt-12">
                <span className="text-4xl text-gray-300">→</span>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">2</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Start Chatting</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Ask questions, seek advice, or just have a conversation. It&apos;s that simple.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center -mt-12">
                <span className="text-4xl text-gray-300">→</span>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                  <span className="text-3xl sm:text-3xl md:text-4xl font-bold text-black">3</span>
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2 sm:mb-3">Get Insights</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Receive wisdom and perspectives from history&apos;s greatest thinkers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4">
              Ready to start?
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Join thousands exploring AI personas
            </p>
            <button
              onClick={handleStartChatting}
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-black text-white text-base sm:text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              Start Chatting
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
              {/* Left - Branding */}
              <div>
                <h4 className="text-xl font-bold text-black mb-2"><span className="italic">AI</span> - Spirit</h4>
                <p className="text-sm text-gray-600">
                  Conversations with legendary minds
                </p>
              </div>

              {/* Center - Navigation (horizontal) */}
              <nav className="flex items-center gap-6">
                <button onClick={() => router.push('/premium')} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Premium
                </button>
                <button onClick={() => setIsContactModalOpen(true)} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Contact Us
                </button>
                <button onClick={() => router.push('/privacy')} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Privacy
                </button>
                <button onClick={() => router.push('/terms')} className="text-sm text-black hover:text-gray-600 transition-colors">
                  Terms
                </button>
              </nav>

              {/* Right - Copyright */}
              <div>
                <p className="text-sm text-gray-500">
                  © 2025 AI-Spirit. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  )
}

// Disable static generation to avoid SSR issues with auth context
export async function getServerSideProps() {
  return {
    props: {},
  }
}
