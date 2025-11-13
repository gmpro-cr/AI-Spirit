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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)

  // Require authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?returnTo=/personas')
    }
  }, [user, loading, router])

  useEffect(() => {
    loadAllPersonas()
  }, [user])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      router.replace('/personas', undefined, { shallow: true })
    }
  }, [router.query])

  const loadAllPersonas = async () => {
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

  useEffect(() => {
    let filtered = personas

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || p.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPersonas(filtered)
  }, [searchQuery, personas])

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
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold">Select a Persona</h1>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(searchQuery ? filteredPersonas : personas).map((persona) => (
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

          {/* Mobile Back Button */}
          <button
            onClick={handleBack}
            className="md:hidden fixed top-4 left-4 p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 shadow-md z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </button>
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
    </>
  )
}
