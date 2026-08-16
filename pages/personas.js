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
import PremiumPromptModal from '@/components/modals/PremiumPromptModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { WebsiteSchema, SoftwareApplicationSchema, ServiceSchema } from '@/components/seo/StructuredData'

const PERSONA_STATS_CACHE_KEY = 'esperit_persona_stats'

/**
 * Last-known popularity counts, read synchronously so the first paint is already
 * in the right order.
 *
 * The grid is painted from the static catalogue before any network call resolves,
 * but the popularity sort needs /api/persona-views. Until that lands every count
 * reads as 0, the comparator is a no-op, and the grid sits in catalogue order —
 * then visibly reshuffles when the stats arrive. Seeding from the last visit means
 * the incoming stats usually reorder nothing the user can see.
 *
 * Returns {} during SSR. Safe because the first render shows skeletons
 * (filteredPersonas is empty), so this never feeds server/client markup.
 */
function readCachedPersonaStats() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(PERSONA_STATS_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function Personas() {
  const router = useRouter()
  const { user, userProfile, isPremium } = useAuth()
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
  const [personaStats, setPersonaStats] = useState(readCachedPersonaStats)
  const [premiumModal, setPremiumModal] = useState({ open: false, reason: 'personas' })

  const handlePersonaClick = (persona) => {
    router.push(`/chat/${persona.slug}`)
  }

  // Create persona is premium-only
  const handleCreatePersonaClick = () => {
    if (!isPremium) {
      setPremiumModal({ open: true, reason: 'createPersona' })
      return
    }
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
      router.replace('/personas', undefined, { shallow: true })
      setIsModalOpen(true)
    }
  }, [router.query, router])

  const loadAllPersonas = async () => {
    // The built-in catalogue is a static import and needs no network, so paint it
    // immediately. Previously the grid was only revealed after BOTH the Supabase
    // query and the stats fetch resolved, so a slow or unreachable backend left
    // 370+ locally-available personas stuck behind skeletons indefinitely.
    const staticPersonas = INITIAL_PERSONAS.filter(p => !p.hidden)

    let localCustom = []
    try {
      localCustom = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
    } catch {
      localCustom = []
    }

    const basePersonas = [...staticPersonas, ...localCustom]
    setPersonas(basePersonas)
    setFilteredPersonas(basePersonas)
    setLoadingPersonas(false)

    // Custom personas from the database — merged in when they arrive.
    // Order is preserved: built-ins first, then local, then remote.
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })

      if (!error && data?.length) {
        const seen = new Set(basePersonas.map(p => p.slug))
        const remote = data.filter(p => !seen.has(p.slug))
        if (remote.length) setPersonas([...basePersonas, ...remote])
      }
    } catch {
      // Non-fatal: the built-in catalogue is already on screen.
    }

    // Stats drive the popularity sort and the message-count badge. Both are
    // enhancements, so they must never block the grid.
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

        // Seed the next visit so it can paint in popularity order immediately.
        try {
          window.localStorage.setItem(PERSONA_STATS_CACHE_KEY, JSON.stringify(statsMap))
        } catch {
          // Quota exceeded or private mode — this session still has the stats
          // in memory, only the head start on the next visit is lost.
        }
      }
    } catch {
      // Non-fatal: cards simply render without a message-count badge.
    }
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

      <div className="flex h-screen bg-white dark:bg-[#0B0B0C] pt-16 pb-16 md:pb-0 transition-colors">
        {/* Side Panel */}
        <SidePanelNew
          showPastChats={true}
          onCreatePersona={handleCreatePersonaClick}
        />

        {/* Main Content */}
        <main className="app-shell-offset flex-1 overflow-y-auto scrollbar-visible flex flex-col bg-white dark:bg-[#0B0B0C]">
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full">
            {/* Search Bar — moved above filters for mobile priority */}
            <div className="mb-4">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/45 dark:text-white/45 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-[15px] text-black dark:text-white glass-matte focus:outline-none focus:bg-white/90 dark:focus:bg-[#0B0B0C]/90 focus:ring-2 focus:ring-black/[0.07] dark:focus:ring-white/[0.07] transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="flex gap-1.5 pb-1 w-max">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 ${
                      selectedCategory === category
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-glass-dark'
                        : 'glass-pill text-black/60 dark:text-white/60 hover:bg-white/80 dark:hover:bg-[#0B0B0C]/80 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* First-time User Welcome Tip */}
            {showWelcomeTip && (
              <div className="mb-8 bg-black text-white dark:bg-white/[0.08] dark:text-white rounded-2xl p-6 relative animate-fadeIn shadow-glass-dark">
                <button
                  onClick={dismissWelcomeTip}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-white/40 hover:text-white hover:bg-white/10 dark:hover:bg-[#0B0B0C]/10 transition-all duration-300"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="font-display font-bold text-xl mb-2">Hey there.</h3>
                <p className="text-gray-300 dark:text-white/30 text-sm leading-relaxed">
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
                  {filteredPersonas.map((persona, index) => (
                    <PersonaCardNew
                      key={persona.slug}
                      persona={persona}
                      onClick={handlePersonaClick}
                      onEdit={persona.is_custom ? handleEditPersona : undefined}
                      onLikeChange={handleLikeChange}
                      messageCount={personaStats[persona.slug]?.message_count}
                      // The first row is the LCP candidate — fetch it eagerly
                      // instead of letting it lazy-load into a grey block.
                      priority={index < 6}
                    />
                  ))}
                </div>

                {/* No Results - Clean Empty State */}
                {filteredPersonas.length === 0 && (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-white/[0.08] rounded-2xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="font-display text-black dark:text-white text-xl font-semibold">Hmm, couldn&apos;t find that one</p>
                    <p className="text-gray-500 dark:text-white/50 text-sm mt-2">Did you spell it right? Or try a different category</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>


      {/* Premium Prompt Modal */}
      <PremiumPromptModal
        isOpen={premiumModal.open}
        reason={premiumModal.reason}
        onClose={() => setPremiumModal({ open: false, reason: 'personas' })}
      />

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
