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
          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block mb-8 mt-6 animate-fadeIn">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl px-5 py-4 text-base text-white placeholder-white/50 focus:border-white/45 focus:from-white/18 focus:via-white/12 focus:to-white/8 shadow-glass focus-glow transition-smooth"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPersonas.map((persona, index) => (
              <div
                key={persona.slug}
                className="animate-fadeIn"
                style={{animationDelay: `${index * 30}ms`, animationFillMode: 'both'}}
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
              <div className="inline-block p-8 bg-gradient-to-br from-white/12 via-white/8 to-white/5 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.1)]">
                <p className="text-white/60 text-lg">No personas found</p>
                <p className="text-white/40 text-sm mt-2">Try a different search</p>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar - Mobile only at bottom */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 bg-black-secondary/98 backdrop-blur-2xl border-t border-white/20 p-3 shadow-[0_-8px_32px_-4px_rgba(0,0,0,0.5)]">
          <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-glass focus-within:shadow-glass-hover transition-smooth overflow-hidden group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
