import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SidePanelNew from '@/components/layout/SidePanel'
import PersonaCardNew from '@/components/personas/PersonaCard'
import CreatePersonaModal from '@/components/personas/CreatePersonaModal'
import EditPersonaModal from '@/components/personas/EditPersonaModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Personas() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [personas, setPersonas] = useState([])
  const [filteredPersonas, setFilteredPersonas] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)
  const [loadingPersonas, setLoadingPersonas] = useState(true)
  const [isMobileSidePanelOpen, setIsMobileSidePanelOpen] = useState(false)
  const [pastChats, setPastChats] = useState([])
  const [loadingPastChats, setLoadingPastChats] = useState(false)

  // Require authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?returnTo=/personas')
    }
  }, [user, loading, router])

  useEffect(() => {
    loadAllPersonas()
  }, [user])

  // Load past chats for mobile side panel
  useEffect(() => {
    const loadPastChats = async () => {
      if (!user) {
        setPastChats([])
        return
      }

      setLoadingPastChats(true)
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session) {
          setLoadingPastChats(false)
          return
        }

        const userId = session.session.user.id
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('session_id', userId)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (!error && data) {
          const chats = data.map(conv => ({
            id: conv.id,
            title: conv.title,
            personaSlug: conv.persona_slug || conv.persona_type,
            updatedAt: conv.updated_at
          }))
          setPastChats(chats)
        }
      } catch (error) {
        console.error('Error loading past chats:', error)
      } finally {
        setLoadingPastChats(false)
      }
    }

    loadPastChats()
  }, [user])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      router.replace('/personas', undefined, { shallow: true })
    }
  }, [router.query])

  const loadAllPersonas = async () => {
    setLoadingPersonas(true)

    // Filter out hidden personas
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

      if (!error && data) {
        allPersonas = [...allPersonas, ...data]
      }
    } catch (error) {
      console.error('Error loading custom personas:', error)
    }

    // Sort personas alphabetically by name
    allPersonas.sort((a, b) => a.name.localeCompare(b.name))

    setPersonas(allPersonas)
    setFilteredPersonas(allPersonas)
    setLoadingPersonas(false)
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

    setFilteredPersonas(filtered)
  }, [searchQuery, selectedCategory, personas])

  return (
    <>
      <Head>
        <title>Select a Persona - AI-Spirit</title>
      </Head>

      <div className="flex h-screen bg-white">
        {/* Side Panel */}
        <SidePanelNew onBack={handleBack} backButtonText="Back to Home" />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto md:ml-64">
          {/* Category Filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
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
            <div className="flex flex-col h-full p-4">
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

              {/* Back to Home */}
              <div className="mb-8">
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

              {/* Past Chats Section */}
              <div className="flex-1 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-black">Past Chats</h2>
                {loadingPastChats ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : pastChats.length > 0 ? (
                  <ul className="space-y-2">
                    {pastChats.map(chat => (
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
                )}
              </div>

              {/* User Account Section */}
              {user && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.full_name || user.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
                        {user?.user_metadata?.full_name?.[0]?.toUpperCase() ||
                         user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-black">
                        {user?.user_metadata?.full_name ||
                         user?.user_metadata?.name ||
                         user?.email || 'User'}
                      </p>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut()
                          router.push('/')
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
