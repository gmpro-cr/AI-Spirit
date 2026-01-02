import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SidePanelNew from '@/components/layout/SidePanel'
import Navbar from '@/components/layout/Navbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import PersonaCardMinimal from '@/components/personas/PersonaCardMinimal'
import { PersonaGridSkeleton } from '@/components/personas/PersonaCardSkeleton'
import CreatePersonaModal from '@/components/personas/CreatePersonaModal'
import EditPersonaModal from '@/components/personas/EditPersonaModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { WebsiteSchema, SoftwareApplicationSchema, ServiceSchema } from '@/components/seo/StructuredData'

function Personas() {
  const router = useRouter()
  const { user } = useAuth()
  const [personas, setPersonas] = useState([])
  const [filteredPersonas, setFilteredPersonas] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [likedPersonaSlugs, setLikedPersonaSlugs] = useState([])
  const [isPremium, setIsPremium] = useState(false)

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

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false)
        return
      }
      try {
        const res = await fetch(`/api/user/subscription-status?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setIsPremium(data.isPremium || false)
        }
      } catch (error) {
        console.error('Error checking premium status:', error)
        setIsPremium(false)
      }
    }
    checkPremiumStatus()
  }, [user])

  const handleCreatePersonaClick = () => {
    if (!isPremium) {
      router.push('/premium')
      return
    }
    setIsModalOpen(true)
  }

  // Load liked personas from localStorage
  useEffect(() => {
    const loadLikedPersonas = () => {
      const liked = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
      setLikedPersonaSlugs(liked)
    }
    loadLikedPersonas()
  }, [])

  useEffect(() => {
    loadAllPersonas()
  }, [])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      router.replace('/', undefined, { shallow: true })
      if (isPremium) {
        setIsModalOpen(true)
      } else {
        router.push('/premium')
      }
    }
  }, [router.query, isPremium])

  const loadAllPersonas = async () => {
    setLoadingPersonas(true)
    let allPersonas = INITIAL_PERSONAS.filter(p => !p.hidden)

    // Load custom personas from localStorage (for guests)
    const localCustom = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
    allPersonas = [...allPersonas, ...localCustom]

    // Load custom personas from database
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })

      if (data) {
        allPersonas = [...allPersonas, ...data]
      }
    } catch (error) {
      console.error('Exception loading custom personas:', error)
    }

    setPersonas(allPersonas)
    setFilteredPersonas(allPersonas)
    setLoadingPersonas(false)
  }

  const handlePersonaCreated = () => {
    loadAllPersonas()
  }

  const handlePersonaUpdated = () => {
    loadAllPersonas()
  }

  const handleLikeChange = () => {
    const liked = JSON.parse(localStorage.getItem('esperit_liked_personas') || '[]')
    setLikedPersonaSlugs(liked)
  }

  // Get unique categories
  const categories = ['For You', 'All', ...new Set(personas.map(p => p.category).filter(Boolean))]

  useEffect(() => {
    let filtered = personas

    if (selectedCategory === 'For You') {
      filtered = personas.filter(p =>
        FEATURED_PERSONAS.includes(p.slug) || likedPersonaSlugs.includes(p.slug)
      )
    } else if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

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
        <title>AI Spirit | Monochrome Edition</title>
        <meta name="description" content="A curated collection of AI spirits." />
      </Head>

      <WebsiteSchema />
      <SoftwareApplicationSchema />
      <ServiceSchema />

      <Navbar />

      <div className="min-h-screen bg-white pt-20 pb-20 md:pb-0 font-sans selection:bg-black selection:text-white transition-colors duration-500">

        {/* Side Panel could be hidden or restyled. Keeping it for functionality but might clash visually. */}
        <SidePanelNew
          showPastChats={true}
          onCreatePersona={handleCreatePersonaClick}
        />

        <main className="md:ml-64 bg-white min-h-screen border-l border-black overflow-hidden relative">

          {/* Hero Section - Editorial Style */}
          <div className="px-6 py-12 md:px-12 md:py-16 lg:py-24 border-b border-black">
            {/* High Contrast Search - Now the main hero element */}
            <div className="max-w-4xl group">
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH THE ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black py-4 text-xl md:text-2xl font-bold uppercase placeholder:text-gray-300 focus:outline-none focus:border-black transition-all group-hover:pl-4"
                />
                <div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Minimalist Filters */}
          <div className="overflow-x-auto border-b border-black scrollbar-hide sticky top-16 z-20 bg-white/95 backdrop-blur-sm">
            <div className="flex whitespace-nowrap px-6 py-4 md:px-12 gap-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-sm tracking-widest uppercase font-bold transition-all relative group ${selectedCategory === category ? 'text-black' : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {category}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-black transition-transform origin-left ${selectedCategory === category ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Persona Grid - Gallery Style */}
          <div className="px-6 py-12 md:px-12">
            {loadingPersonas ? (
              <PersonaGridSkeleton count={8} />
            ) : (
              <>
                {filteredPersonas.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
                    {filteredPersonas.map((persona) => (
                      <PersonaCardMinimal
                        key={persona.slug}
                        persona={persona}
                        onLikeChange={handleLikeChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <h3 className="text-4xl font-black text-gray-200 uppercase">Void</h3>
                    <p className="text-gray-400 mt-2">No spirits found in this frequency.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Decor */}
          <div className="border-t border-black p-12 text-center md:text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
              © 2026 AI-Spirit Archive. All rights reserved.
            </p>
          </div>

        </main>
      </div>

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

      <MobileBottomNav onCreatePersona={handleCreatePersonaClick} />
    </>
  )
}

export default Personas
