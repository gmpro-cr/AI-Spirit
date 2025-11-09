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
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [personaToEdit, setPersonaToEdit] = useState(null)

  // Get unique categories with color mappings
  const categories = ['All', ...new Set(INITIAL_PERSONAS.filter(p => !p.hidden).map(p => p.category))]

  // Category color gradients
  const categoryColors = {
    'All': 'from-purple-500 to-pink-500',
    'Business': 'from-purple-500 to-pink-500',
    'Historical': 'from-cyan-500 to-blue-500',
    'Spiritual': 'from-green-500 to-emerald-500',
    'Entertainment': 'from-orange-500 to-red-500'
  }

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

    // Load custom personas from localStorage
    const localCustom = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
    allPersonas = [...allPersonas, ...localCustom]

    // Load ALL custom personas from database
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

  // Filter personas by category and search
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
  }, [searchQuery, selectedCategory, personas])

  // Count personas per category
  const getCategoryCount = (category) => {
    if (category === 'All') return personas.length
    return personas.filter(p => p.category === category).length
  }

  return (
    <>
      <Head>
        <title>Personas - AI-Spirit</title>
      </Head>

      <ParticlesBackground />
      <Navbar />
      <SidePanel />

      <main className="relative min-h-screen bg-black-primary pb-20 px-4 pt-[72px] lg:pt-0 lg:pl-72 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="hidden lg:block pt-8 pb-6 animate-fadeIn">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Explore AI Personas
            </h1>
            <p className="text-white/60 text-lg font-light">
              Choose from {personas.length} unique personalities across multiple categories
            </p>
          </div>

          {/* Category Tabs - Desktop */}
          <div className="hidden lg:block mb-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative px-6 py-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-500 overflow-hidden ${
                    selectedCategory === category
                      ? 'text-white shadow-[0_8px_32px_-4px_rgba(102,126,234,0.4),0_4px_16px_rgba(0,0,0,0.3)] scale-[1.05] hover:scale-[1.07]'
                      : 'bg-gradient-to-br from-white/10 via-white/6 to-white/3 backdrop-blur-xl border border-white/20 text-white hover:from-white/15 hover:via-white/10 hover:to-white/5 hover:border-white/30 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]'
                  }`}
                >
                  {selectedCategory === category && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]} opacity-100`}></div>
                      <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}></div>
                    </>
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {category}
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                      selectedCategory === category
                        ? 'bg-black/20 text-white'
                        : 'bg-white/15 text-white/80'
                    }`}>
                      {getCategoryCount(category)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-br from-white/12 via-white/8 to-white/5 backdrop-blur-2xl border border-white/25 rounded-full px-14 py-4 text-base text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:from-white/15 focus:via-white/10 focus:to-white/8 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3),inset_0_2px_1px_rgba(255,255,255,0.1)] focus:shadow-[0_12px_48px_-4px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.4),inset_0_2px_1px_rgba(255,255,255,0.12)] transition-all duration-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/8 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="hidden lg:flex items-center justify-between mb-6 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <p className="text-white/60 text-sm">
              {filteredPersonas.length} {filteredPersonas.length === 1 ? 'persona' : 'personas'} found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Personas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn" style={{animationDelay: '0.4s'}}>
            {filteredPersonas.map((persona, index) => (
              <div
                key={persona.slug}
                className="animate-fadeIn"
                style={{animationDelay: `${0.45 + index * 0.02}s`, animationFillMode: 'both'}}
              >
                <PersonaCard
                  persona={persona}
                  onEdit={persona.is_custom ? handleEditPersona : undefined}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPersonas.length === 0 && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="inline-block p-10 bg-gradient-to-br from-white/10 via-white/6 to-white/3 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),inset_0_2px_1px_rgba(255,255,255,0.08)]">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-white/70 text-xl font-semibold mb-2">No personas found</p>
                <p className="text-white/50 text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search & Filters */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 bg-gradient-to-t from-black-secondary via-black-secondary/98 to-black-secondary/95 backdrop-blur-2xl border-t border-white/15 p-3 shadow-[0_-8px_32px_-4px_rgba(0,0,0,0.6)]">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  selectedCategory === category
                    ? 'text-white shadow-[0_4px_16px_rgba(102,126,234,0.4)]'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                {selectedCategory === category && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]}`}></div>
                )}
                <span className="relative z-10">
                  {category} ({getCategoryCount(category)})
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/5 backdrop-blur-xl border border-white/25 rounded-full shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
            <input
              type="text"
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none rounded-full px-5 py-3 text-sm text-white placeholder-white/50 focus:outline-none"
            />
          </div>
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
