import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SidePanelNew from '@/components/layout/SidePanel'
import PersonaCardNew from '@/components/personas/PersonaCard'
import CreatePersonaModal from '@/components/personas/CreatePersonaModal'
import EditPersonaModal from '@/components/personas/EditPersonaModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/middleware/withAuth'
import { useAuth } from '@/context/AuthContext'

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
  }, [])

  useEffect(() => {
    loadAllPersonas()
  }, [])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      router.replace('/personas', undefined, { shallow: true })
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
  const categories = ['All', 'For You', ...new Set(personas.map(p => p.category).filter(Boolean))]

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
        <title>Select a Persona - AI-Spirit</title>
      </Head>

      <div className="flex h-screen bg-white">
        {/* Side Panel */}
        <SidePanelNew
          onBack={handleBack}
          backButtonText="Back to Home"
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
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 text-base text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black h-12"
            />
          </div>

          {/* Loading State */}
          {loadingPersonas ? (
            <div className="text-center py-20">
              <p className="text-black text-lg">Loading personas...</p>
            </div>
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

              {/* No Results */}
              {filteredPersonas.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-black text-lg">No personas found</p>
                  <p className="text-black text-sm mt-2">Try a different search</p>
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
            <div className="flex flex-col h-full p-4 justify-between">
              <div>
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileSidePanelOpen(false)}
                  className="self-end p-2 hover:bg-gray-200 rounded-lg transition-colors mb-4"
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

                {/* Create Persona Button */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setIsMobileSidePanelOpen(false)
                      setIsModalOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
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

                {/* Past Chats Section */}
                <h2 className="text-lg font-semibold mb-4 text-black">Past Chats</h2>
                {(() => {
                  const conversationsList = JSON.parse(localStorage.getItem('esperit_conversations') || '[]')
                  return conversationsList.length > 0 ? (
                    <ul className="space-y-2">
                      {conversationsList.map(chat => (
                        <li key={chat.id}>
                          <button
                            onClick={() => {
                              setIsMobileSidePanelOpen(false)
                              router.push(`/chat/${chat.personaSlug}?conversationId=${chat.id}`)
                            }}
                            className="block w-full text-left p-2 rounded-md text-sm text-gray-700 hover:bg-gray-200 truncate transition-colors"
                          >
                            {chat.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No past chats yet</p>
                  )
                })()}
              </div>

              {/* Back to Home Button */}
              <div className="mt-4 border-t border-gray-300 pt-4">
                <button
                  onClick={() => {
                    setIsMobileSidePanelOpen(false)
                    handleBack()
                  }}
                  className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Home
                </button>
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
    </>
  )
}

export default withAuth(Personas)
