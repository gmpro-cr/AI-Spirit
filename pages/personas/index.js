import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import PersonaCard from '@/components/personas/PersonaCard'
import { INITIAL_PERSONAS } from '@/data/personas'

export default function Personas() {
  const [personas, setPersonas] = useState([])
  const [filteredPersonas, setFilteredPersonas] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // For now, use local data
    // Later: fetch from API
    setPersonas(INITIAL_PERSONAS)
    setFilteredPersonas(INITIAL_PERSONAS)
  }, [])

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

      <Navbar />

      <main className="min-h-screen bg-black-primary pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Choose Your Persona</h1>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black-secondary border border-gray-800 rounded-lg px-4 py-3 text-text-primary focus:border-neon-cyan focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === category
                    ? 'bg-neon-cyan text-black font-semibold'
                    : 'bg-black-secondary text-text-secondary hover:bg-black-tertiary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Personas Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersonas.map(persona => (
              <PersonaCard key={persona.slug} persona={persona} />
            ))}
          </div>

          {filteredPersonas.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              No personas found matching your criteria
            </div>
          )}
        </div>
      </main>
    </>
  )
}
