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
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)

  useEffect(() => {
    loadAllPersonas()
  }, [user])

  // Check for ?create=true query parameter
  useEffect(() => {
    if (router.query.create === 'true') {
      setIsModalOpen(true)
      // Remove query parameter from URL
      router.replace('/personas', undefined, { shallow: true })
    }
  }, [router.query])

  const loadAllPersonas = async () => {
    let allPersonas = [...INITIAL_PERSONAS]

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

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPersonas(filtered)
  }, [selectedCategory, searchQuery, personas])

  const categories = ['All', ...new Set(personas.map(p => p.category))]

  return (
    <>
      <Head>
        <title>Personas - AI-Spirit</title>
      </Head>

      <ParticlesBackground />
      <Navbar />
      <SidePanel />

      <main className="relative min-h-screen bg-black-primary pt-20 sm:pt-20 pb-16 px-4 lg:pl-72 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Search and Create Button */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-4">
            <div className="relative flex-1 bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-400 ease-premium focus-within:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/12 via-transparent to-transparent opacity-50 pointer-events-none" />
              <input
                type="text"
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative z-10 w-full bg-transparent border-none rounded-3xl px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/50 focus:outline-none font-light tracking-wide"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/45 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-400 ease-premium whitespace-nowrap overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <span className="relative z-10 tracking-wide">Create Persona</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-7 sm:mb-9">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group relative px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full backdrop-blur-2xl transition-all duration-400 ease-premium overflow-hidden ${
                  selectedCategory === category
                    ? 'bg-gradient-to-br from-white/18 via-white/14 to-white/10 border border-white/40 text-white font-semibold shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1)] scale-[1.02]'
                    : 'bg-gradient-to-br from-white/10 via-white/7 to-white/4 border border-white/20 text-white/80 font-medium hover:from-white/15 hover:via-white/11 hover:to-white/7 hover:border-white/30 hover:text-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-[1.02]'
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <span className="relative z-10 tracking-wide">{category}</span>
              </button>
            ))}
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPersonas.map(persona => (
              <PersonaCard
                key={persona.slug}
                persona={persona}
                onEdit={persona.is_custom ? handleEditPersona : undefined}
              />
            ))}
          </div>

          {filteredPersonas.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              No personas found matching your criteria
            </div>
          )}
        </div>
      </main>

      {/* Create Persona Modal */}
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
