import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '@/components/layout/Navbar'
import ParticlesBackground from '@/components/layout/ParticlesBackground'
import SidePanel from '@/components/layout/SidePanel'
import PersonaCard from '@/components/personas/PersonaCard'
import CreatePersonaModal from '@/components/personas/CreatePersonaModal'
import EditPersonaModal from '@/components/personas/EditPersonaModal'
import { INITIAL_PERSONAS } from '@/data/personas'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Personas() {
  const { user } = useAuth()
  const router = useRouter()
  const [personas, setPersonas] = useState([])
  const [filteredPersonas, setFilteredPersonas] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)

  useEffect(() => {
    loadAllPersonas()
  }, [user])

  // Check for ?create=true query parameter (keep functionality for programmatic access)
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      // Remove query parameter from URL
      router.replace('/personas', undefined, { shallow: true })
    }
  }, [router.query])

  const loadAllPersonas = async () => {
    // Filter out hidden personas from INITIAL_PERSONAS
    let allPersonas = INITIAL_PERSONAS.filter(p => !p.hidden)

    // Load custom personas from localStorage (for guests)
    const localCustom = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
    allPersonas = [...allPersonas, ...localCustom]

    // Load ALL custom personas from database (visible to everyone)
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('is_custom', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Add all custom personas from database
        allPersonas = [...allPersonas, ...data]
      }
    } catch (error) {
      console.error('Error loading custom personas:', error)
    }

    setPersonas(allPersonas)
    setFilteredPersonas(allPersonas)
  }

  const handlePersonaCreated = (newPersona) => {
    loadAllPersonas()
  }

  const handleEditPersona = (persona) => {
    setPersonaToEdit(persona)
    setIsEditModalOpen(true)
  }

  const handlePersonaUpdated = (updatedPersona) => {
    loadAllPersonas()
  }

  useEffect(() => {
    let filtered = personas

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPersonas(filtered)
  }, [searchQuery, personas])

  return (
    <>
      <Head>
        <title>Personas - AI-Spirit</title>
      </Head>

      <ParticlesBackground />
      <Navbar />
      <SidePanel />

      <main className="relative min-h-screen bg-black-primary pb-16 px-4 pt-[72px] lg:pt-0 lg:pl-72 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header - Desktop only */}
          <div className="hidden lg:block mb-8 mt-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Explore Personas
                </h1>
                <p className="text-white/50 text-sm flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></span>
                  {filteredPersonas.length} personas available
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:flex mb-8 animate-fadeIn">
            <div className="relative flex-1 bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-400 ease-premium focus-within:shadow-[0_6px_24px_-2px_rgba(147,51,234,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] focus-within:border-purple-400/50 overflow-hidden group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-50 pointer-events-none" />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative z-10 w-full bg-transparent border-none rounded-3xl pl-14 pr-5 py-4 text-base text-white placeholder-white/50 focus:outline-none font-light tracking-wide"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-fadeIn">
            {filteredPersonas.map((persona, index) => (
              <div
                key={persona.slug}
                style={{animationDelay: `${index * 30}ms`}}
                className="animate-fadeIn"
              >
                <PersonaCard
                  persona={persona}
                  onEdit={persona.is_custom ? handleEditPersona : undefined}
                />
              </div>
            ))}
          </div>

          {filteredPersonas.length === 0 && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="inline-block p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-white/60 text-lg font-medium">No personas found</p>
                <p className="text-white/40 text-sm mt-2">Try adjusting your search</p>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar - Mobile only at bottom */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 bg-black-secondary/98 backdrop-blur-2xl border-t border-white/15 p-3 shadow-[0_-4px_24px_-2px_rgba(0,0,0,0.4)]">
          <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-400 ease-premium focus-within:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative z-10 w-full bg-transparent border-none rounded-3xl px-5 py-3 text-base text-white placeholder-white/50 focus:outline-none font-light tracking-wide"
            />
          </div>
        </div>
      </main>

      {/* Create Persona Modal - Kept for programmatic access */}
      <CreatePersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPersonaCreated={handlePersonaCreated}
      />

      {/* Edit Persona Modal */}
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
