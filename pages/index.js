import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SidePanelNew from '@/components/layout/SidePanel'
import Navbar from '@/components/layout/Navbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import PersonaCardNew from '@/components/personas/PersonaCard'
import { PersonaGridSkeleton } from '@/components/personas/PersonaCardSkeleton'
import CreatePersonaModal from '@/components/personas/CreatePersonaModal'
import EditPersonaModal from '@/components/personas/EditPersonaModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/middleware/withAuth'
import { useAuth } from '@/context/AuthContext'
import { WebsiteSchema, SoftwareApplicationSchema } from '@/components/seo/StructuredData'

function Personas() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [personas, setPersonas] = useState([])
  const [filteredPersonas, setFilteredPersonas] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [isMobileSidePanelOpen, setIsMobileSidePanelOpen] = useState(false)
  const [likedPersonaSlugs, setLikedPersonaSlugs] = useState([])
  const [showWelcomeTip, setShowWelcomeTip] = useState(false)

  // Rotating search placeholders
  const searchPrompts = [
    'Who do you need to talk to today?',
    'Find your perfect advisor...',
    'Looking for some guidance?',
    'Search for a conversation partner...'
  ]
  const [searchPlaceholder] = useState(() => searchPrompts[Math.floor(Math.random() * searchPrompts.length)])

  // Default featured personas for "For You" section
  const FEATURED_PERSONAS = [
    'life-coach',
    'career-mentor',
    'travel-guide',
    'fitness-coach',
    'money-manager',
    'astro-guide',
    'legal-advisor',
    'medical-advisor',
    'numerology-expert'
  ]

  // Load liked personas from localStorage
  useEffect(() => {
    const loadLikedPersonas = () => {
      const liked = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
      setLikedPersonaSlugs(liked)
    }
    loadLikedPersonas()

    // Check if first-time user for welcome tip
    const hasSeenWelcome = localStorage.getItem('esperit_seen_welcome')
    if (!hasSeenWelcome) {
      setShowWelcomeTip(true)
    }
  }, [])

  const dismissWelcomeTip = () => {
    setShowWelcomeTip(false)
    localStorage.setItem('esperit_seen_welcome', 'true')
  }

  useEffect(() => {
    loadAllPersonas()
  }, [])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      router.replace('/', undefined, { shallow: true })
    }
  }, [router.query])

  const loadAllPersonas = async () => {
    console.log('=== LOADING ALL PERSONAS ===')
    setLoadingPersonas(true)

    // Filter out hidden personas
    let allPersonas = INITIAL_PERSONAS.filter(p => !p.hidden)
    console.log('Initial personas (non-hidden):', allPersonas.length)

    // Load custom personas from localStorage (for guests)
    const localCustom = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
    console.log('Custom personas from localStorage:', localCustom.length)
    allPersonas = [...allPersonas, ...localCustom]

    // Load custom personas from database
    try {
      console.log('Fetching custom personas from database...')
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading custom personas from database:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        console.log('✅ Custom personas from database:', data?.length || 0)
        if (data && data.length > 0) {
          console.log('Database personas:', data.map(p => ({ name: p.name, slug: p.slug })))
        }
        if (data) {
          allPersonas = [...allPersonas, ...data]
        }
      }
    } catch (error) {
      console.error('❌ Exception loading custom personas:', error)
      console.error('Error stack:', error.stack)
    }

    console.log('Total personas loaded:', allPersonas.length)
    // Preserve the order from INITIAL_PERSONAS (priority personas first)
    // Custom personas from localStorage and database are appended after
    setPersonas(allPersonas)
    setFilteredPersonas(allPersonas)
    setLoadingPersonas(false)
    console.log('=== PERSONAS LOADING COMPLETE ===')
  }

  const handlePersonaCreated = () => {
    loadAllPersonas()
  }

  const handleEditPersona = (persona) => {
    setPersonaToEdit(persona)
    setIsEditModalOpen(true)
  }

  const handlePersonaUpdated = () => {
    loadAllPersonas()
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleLikeChange = () => {
    const liked = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
    setLikedPersonaSlugs(liked)
  }

  // Get unique categories
  const categories = ['For You', 'All', ...new Set(personas.map(p => p.category).filter(Boolean))]

  useEffect(() => {
    let filtered = personas

    // Filter by category
    if (selectedCategory === 'For You') {
      // For You category - show featured personas + liked personas
      filtered = personas.filter(p =>
        FEATURED_PERSONAS.includes(p.slug) || likedPersonaSlugs.includes(p.slug)
      )
    } else if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || p.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPersonas(filtered)
  }, [searchQuery, selectedCategory, personas, likedPersonaSlugs])

  return (
    <>
      <Head>
        <title>Browse AI Personas - Parenting, Wellness, Relationships | AI - Spirit</title>
        <meta name="description" content="Explore 40+ AI personas for parenting advice, mental wellness, relationship counseling, cooking tips, and more. Chat with expert AI coaches available 24/7." />
        <meta name="keywords" content="AI personas, parenting coach, wellness coach, relationship advisor, home chef, AI chat, expert advice" />
        <link rel="canonical" href="https://ai-spirit.in/personas" />
        <meta property="og:title" content="Browse AI Personas | AI - Spirit" />
        <meta property="og:description" content="Explore 40+ AI personas for parenting, wellness, relationships and more." />
        <meta property="og:url" content="https://ai-spirit.in/personas" />
      </Head>

      {/* Structured Data for SEO */}
      <WebsiteSchema />
      <SoftwareApplicationSchema />

      {/* Navbar */}
      <Navbar />

      <div className="flex h-screen bg-white pt-16 pb-16 md:pb-0">
        {/* Side Panel */}
        <SidePanelNew
          showPastChats={true}
          onCreatePersona={() => setIsModalOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto md:ml-64">
          {/* Category Filter */}
          <div className="mb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar with Hamburger Menu */}
          <div className="mb-6 flex items-center gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileSidePanelOpen(true)}
              className="md:hidden p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 shadow-lg transition-all flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Search Input */}
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 text-base text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black h-12"
            />
          </div>

          {/* First-time User Welcome Tip */}
          {showWelcomeTip && (
            <div className="mb-6 bg-black text-white rounded-2xl p-5 relative animate-fadeIn">
              <button
                onClick={dismissWelcomeTip}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="font-display font-bold text-xl mb-2">Hey there! 👋</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                You&apos;re about to chat with AI personalities who actually get you. Pick anyone below—they&apos;re here 24/7, judgment-free.
              </p>
            </div>
          )}

          {/* Loading State with Skeleton */}
          {loadingPersonas ? (
            <PersonaGridSkeleton count={10} />
          ) : (
            <>
              {/* Personas Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredPersonas.map((persona) => (
                  <PersonaCardNew
                    key={persona.slug}
                    persona={persona}
                    onEdit={persona.is_custom ? handleEditPersona : undefined}
                    onLikeChange={handleLikeChange}
                  />
                ))}
              </div>

              {/* No Results - Playful Empty State */}
              {filteredPersonas.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="font-display text-black text-xl font-semibold">Hmm, couldn&apos;t find that one</p>
                  <p className="text-gray-500 text-sm mt-2">Did you spell it right? Or try a different category 🤔</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Side Panel */}
      {isMobileSidePanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
            onClick={() => setIsMobileSidePanelOpen(false)}
          />

          {/* Side Panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-50 border-r border-gray-200 z-[70] md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full p-6 justify-between">
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Close Button */}
                <div className="mb-6 pb-5 border-b border-gray-300">
                  <button
                    onClick={() => setIsMobileSidePanelOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors -ml-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Create Persona Button */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setIsMobileSidePanelOpen(false)
                      setIsModalOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Persona
                  </button>
                </div>

                {/* Past Chats Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-black">Past Chats</h2>
                </div>

                {/* Past Chats List */}
                <div className="flex-1 overflow-y-auto">
                  {(() => {
                    const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
                    return conversationsList.length > 0 ? (
                      <ul className="space-y-3">
                        {conversationsList.map(chat => (
                          <li key={chat.id}>
                            <button
                              onClick={() => {
                                setIsMobileSidePanelOpen(false)
                                router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)
                              }}
                              className="flex items-center gap-3 w-full text-left p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              {chat.personaImage && (
                                <img
                                  src={chat.personaImage}
                                  alt={chat.personaName}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-600 truncate mb-0.5">{chat.personaName}</p>
                                <p className="text-sm truncate">{chat.title}</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No past chats yet</p>
                    )
                  })()}
                </div>
              </div>

              {/* Bottom Section - User Info or Sign In */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMobileSidePanelOpen(false)
                      // Open settings modal if needed
                    }}
                    className="flex items-center w-full hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex-shrink-0 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {user.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    {/* Settings cog icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileSidePanelOpen(false)
                      router.push('/auth/signin')
                    }}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreatePersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPersonaCreated={handlePersonaCreated}
      />

      <EditPersonaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setPersonaToEdit(null)
        }}
        persona={personaToEdit}
        onPersonaUpdated={handlePersonaUpdated}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onCreatePersona={() => setIsModalOpen(true)} />
    </>
  )
}

export default Personas
