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

          {/* Search Bar */}
          <div className="mb-6">
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
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
