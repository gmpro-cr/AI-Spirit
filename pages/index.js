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
import { WebsiteSchema, SoftwareApplicationSchema, ServiceSchema } from '@/components/seo/StructuredData'

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
  const [likedPersonaSlugs, setLikedPersonaSlugs] = useState([])
  const [showWelcomeTip, setShowWelcomeTip] = useState(false)
  const [personaStats, setPersonaStats] = useState({}) // { slug: { message_count, view_count } }

  // Handle create persona click - open modal directly (free for all users)
  const handleCreatePersonaClick = () => {
    setIsModalOpen(true)
  }

  // Rotating search placeholders
  const searchPrompts = [
    'Who do you need to talk to today?',
    'Find your perfect advisor...',
    'Looking for some guidance?',
    'Search for a conversation partner...'
  ]
  const [searchPlaceholder] = useState(() => searchPrompts[Math.floor(Math.random() * searchPrompts.length)])

  // Default featured personas for "For You" section - balanced mix for engagement
  const FEATURED_PERSONAS = [
    // Romance - hook companion-seekers
    'cold-ceo',
    'soft-boyfriend',
    'campus-crush',
    // Entertainment - keep them laughing
    'unhinged-therapist',
    'michael-scott',
    'jack-sparrow',
    // Trending Anime - capture anime fans
    'gojo-satoru',
    'sung-jin-woo',
    // Utility - practical value = returns
    'hype-man',
    'study-buddy',
    'life-coach',
    // Iconic Characters - universal appeal
    'tommy-shelby',
    'joker-ledger'
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
      router.replace('/', undefined, { shallow: true })
      setIsModalOpen(true)
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

    // Fetch persona stats (message counts) BEFORE showing content
    try {
      const statsRes = await fetch('/api/persona-views')
      if (statsRes.ok) {
        const { views } = await statsRes.json()
        const statsMap = {}
        views?.forEach(v => {
          statsMap[v.persona_slug] = {
            message_count: v.message_count || 0,
            view_count: v.view_count || 0
          }
        })
        setPersonaStats(statsMap)
        console.log('[Persona Stats] Loaded stats for', Object.keys(statsMap).length, 'personas')
      }
    } catch (error) {
      console.error('[Persona Stats] Error fetching:', error)
    }

    // Now that both personas AND stats are loaded, show content
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
  const categories = ['All', ...new Set(personas.map(p => p.category).filter(Boolean))]

  useEffect(() => {
    let filtered = personas

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || p.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort by message count (highest first)
    filtered = [...filtered].sort((a, b) => {
      const countA = personaStats[a.slug]?.message_count || 0
      const countB = personaStats[b.slug]?.message_count || 0
      return countB - countA
    })

    setFilteredPersonas(filtered)
  }, [searchQuery, selectedCategory, personas, likedPersonaSlugs, personaStats])

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
      <ServiceSchema />

      {/* Navbar */}
      <Navbar />

      <div className="flex h-screen bg-white pt-16 pb-16 md:pb-0 transition-colors">
        {/* Side Panel */}
        <SidePanelNew
          showPastChats={true}
          onCreatePersona={handleCreatePersonaClick}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-visible md:ml-64 flex flex-col bg-white">
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full">
            {/* Category Filter */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                      ? 'bg-black text-white shadow-soft'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 text-base text-black bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 shadow-xs focus:shadow-soft transition-all duration-300"
              />
            </div>

            {/* First-time User Welcome Tip */}
            {showWelcomeTip && (
              <div className="mb-8 bg-black text-white rounded-2xl p-6 relative animate-fadeIn shadow-soft-lg">
                <button
                  onClick={dismissWelcomeTip}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="font-display font-bold text-xl mb-2">Hey there.</h3>
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredPersonas.map((persona) => (
                    <PersonaCardNew
                      key={persona.slug}
                      persona={persona}
                      onEdit={persona.is_custom ? handleEditPersona : undefined}
                      onLikeChange={handleLikeChange}
                      messageCount={personaStats[persona.slug]?.message_count}
                    />
                  ))}
                </div>

                {/* No Results - Clean Empty State */}
                {filteredPersonas.length === 0 && (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="font-display text-black text-xl font-semibold">Hmm, couldn&apos;t find that one</p>
                    <p className="text-gray-500 text-sm mt-2">Did you spell it right? Or try a different category</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>


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
      <MobileBottomNav onCreatePersona={handleCreatePersonaClick} />
    </>
  )
}

export default Personas
