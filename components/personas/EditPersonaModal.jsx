import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function EditPersonaModal({ isOpen, onClose, persona, onPersonaUpdated }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    systemPrompt: ''
  })

  // Populate form when persona changes
  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name || '',
        description: persona.description || '',
        avatarUrl: persona.avatar_url || '',
        systemPrompt: persona.system_prompt || ''
      })
    }
  }, [persona])

  if (!isOpen || !persona) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields (Name, Description, and System Prompt)')
      return
    }

    setLoading(true)

    try {
      // Update in localStorage
      const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
      const index = customPersonas.findIndex(p => p.slug === persona.slug)

      if (index !== -1) {
        // Update existing persona
        customPersonas[index] = {
          ...customPersonas[index],
          name: formData.name,
          description: formData.description,
          avatar_url: formData.avatarUrl || null,
          system_prompt: formData.systemPrompt
        }

        localStorage.setItem('esperit_custom_personas', JSON.stringify(customPersonas))
        console.log('Persona updated in localStorage:', customPersonas[index])

        onPersonaUpdated(customPersonas[index])
        alert('Persona updated successfully!')
        onClose()
      } else {
        throw new Error('Persona not found in localStorage')
      }
    } catch (error) {
      console.error('Error updating persona:', error)
      alert(`Failed to update persona: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return
    }

    setLoading(true)

    try {
      // Delete from localStorage
      const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
      const filteredPersonas = customPersonas.filter(p => p.slug !== persona.slug)

      localStorage.setItem('esperit_custom_personas', JSON.stringify(filteredPersonas))
      console.log('Persona deleted from localStorage')

      alert('Persona deleted successfully!')
      onPersonaUpdated(null) // Signal deletion
      onClose()
    } catch (error) {
      console.error('Error deleting persona:', error)
      alert(`Failed to delete persona: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl shadow-black/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/15 before:to-transparent before:opacity-50 before:pointer-events-none">
        <div className="relative z-10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">Edit Persona</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Persona Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Albert Einstein, My Life Coach, Tech Expert"
                className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl px-4 py-3 text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none shadow-inner transition-all duration-300"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <p className="text-sm text-white/70 mb-2">
                Short description (max 2 words) shown on the persona card
              </p>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Physics Genius, Life Coach, Tech Expert"
                maxLength={50}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl px-4 py-3 text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none shadow-inner transition-all duration-300"
              />
            </div>

            {/* Avatar URL Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Avatar Image URL <span className="text-white/60">(Optional)</span>
              </label>
              <p className="text-sm text-white/70 mb-2">
                Link to an image for the persona card
              </p>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl px-4 py-3 text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none shadow-inner transition-all duration-300"
              />
              <p className="text-xs text-white/60 mt-2">
                Tip: Use a direct image URL (jpg, png, etc.). Leave blank to use initials.
              </p>
            </div>

            {/* System Prompt Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                System Prompt <span className="text-red-400">*</span>
              </label>
              <p className="text-sm text-white/70 mb-2">
                Define how this persona should behave and respond
              </p>
              <textarea
                required
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Example: You are Albert Einstein. Respond with wisdom about physics, curiosity about the universe, and occasional humor. Keep responses thoughtful and encouraging. Reference relativity and scientific thinking when relevant."
                rows={8}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl px-4 py-3 text-white placeholder-white/60 focus:bg-white/15 focus:border-white/50 focus:outline-none resize-none shadow-inner transition-all duration-300"
              />
              <p className="text-xs text-white/60 mt-2">
                Tip: Be specific about personality, knowledge areas, and response style
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.description || !formData.systemPrompt}
                className="relative flex-1 bg-white/15 backdrop-blur-xl border border-white/40 text-white font-semibold px-6 py-3 rounded-3xl hover:bg-white/25 hover:border-white/60 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50 before:pointer-events-none"
              >
                <span className="relative z-10">{loading ? 'Updating...' : 'Update Persona'}</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="relative px-6 py-3 bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-red-200 font-semibold rounded-3xl hover:bg-red-500/30 hover:border-red-500/70 shadow-lg shadow-black/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-red-500/10 before:to-transparent before:opacity-50 before:pointer-events-none"
              >
                <span className="relative z-10">Delete</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="relative px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white rounded-3xl hover:bg-white/20 hover:border-white/50 shadow-lg shadow-black/20 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-50 before:pointer-events-none"
              >
                <span className="relative z-10">Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
