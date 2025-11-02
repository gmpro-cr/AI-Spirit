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

    // Load custom personas from database (for authenticated users)
    if (user) {
      try {
        const { data, error } = await supabase
          .from('personas')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_custom', true)

        if (!error && data) {
          allPersonas = [...allPersonas, ...data]
        }
      } catch (error) {
        console.error('Error loading custom personas:', error)
      }
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
        <title>Personas - Esperit.AI</title>
      </Head>

      <ParticlesBackground />
      <Navbar />
      <SidePanel />

      <main className="relative min-h-screen bg-black-primary pt-20 pb-16 px-4 pl-72 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Search and Create Button */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/40 rounded-3xl shadow-[0_2px_8px_0_rgba(0,0,0,0.2)] transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/20 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none">
              <input
                type="text"
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative z-10 w-full bg-transparent border-none rounded-3xl px-5 py-3 text-white placeholder-white/60 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-2 border-white/50 text-white font-semibold px-6 py-3 rounded-3xl hover:from-white/30 hover:via-white/25 hover:to-white/15 hover:border-white/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_0_rgba(255,255,255,0.3)] transition-all duration-300 whitespace-nowrap before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-white/30 before:via-transparent before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none"
            >
              <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Create Persona</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-4 py-2 rounded-3xl backdrop-blur-2xl transition-all duration-300 shadow-[0_2px_8px_0_rgba(0,0,0,0.2)] before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none after:absolute after:inset-[1px] after:rounded-3xl after:pointer-events-none ${
                  selectedCategory === category
                    ? 'bg-gradient-to-br from-white/25 via-white/20 to-white/15 border-2 border-white/60 text-white font-semibold hover:shadow-[0_2px_12px_0_rgba(255,255,255,0.3)] before:bg-gradient-to-tr before:from-white/30 before:via-transparent before:to-transparent before:opacity-60 after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-white/10'
                    : 'bg-gradient-to-br from-white/15 via-white/10 to-white/5 border-2 border-white/40 text-white/90 hover:from-white/20 hover:via-white/15 hover:to-white/10 hover:border-white/50 hover:text-white before:bg-gradient-to-tr before:from-white/20 before:via-transparent before:to-transparent before:opacity-50 after:bg-gradient-to-br after:from-transparent after:via-white/3 after:to-white/8'
                }`}
              >
                <span className="relative z-10 drop-shadow-sm">{category}</span>
              </button>
            ))}
          </div>

          {/* Personas Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
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
