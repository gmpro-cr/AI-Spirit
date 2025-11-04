import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

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
      // Update in database if user is authenticated and persona has ID
      if (user && persona.id) {
        console.log('Updating persona in database')

        // Generate default avatar URL if none provided
        const avatarUrl = formData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=400&background=4F46E5&color=fff&bold=true&format=png`

        // Generate bio from system prompt (required field)
        const bio = formData.systemPrompt.length > 200
          ? formData.systemPrompt.substring(0, 200) + '...'
          : formData.systemPrompt

        const { data, error } = await supabase
          .from('personas')
          .update({
            name: formData.name,
            short_description: formData.description,
            bio: bio,
            avatar_url: avatarUrl,
            system_prompt: formData.systemPrompt
          })
          .eq('id', persona.id)
          .eq('user_id', user.id) // Ensure user owns this persona
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw new Error(`Database error: ${error.message}`)
        }

        console.log('Persona updated in database:', data)
        onPersonaUpdated(data)
      } else {
        // Update in localStorage for guest users
        const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
        const index = customPersonas.findIndex(p => p.slug === persona.slug)

        if (index !== -1) {
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
        } else {
          throw new Error('Persona not found in localStorage')
        }
      }

      alert('Persona updated successfully!')
      onClose()
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
      // Delete from database if user is authenticated and persona has ID
      if (user && persona.id) {
        console.log('Deleting persona from database')

        const { error } = await supabase
          .from('personas')
          .delete()
          .eq('id', persona.id)
          .eq('user_id', user.id) // Ensure user owns this persona

        if (error) {
          console.error('Database error:', error)
          throw new Error(`Database error: ${error.message}`)
        }

        console.log('Persona deleted from database')
      } else {
        // Delete from localStorage for guest users
        const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
        const filteredPersonas = customPersonas.filter(p => p.slug !== persona.slug)

        localStorage.setItem('esperit_custom_personas', JSON.stringify(filteredPersonas))
        console.log('Persona deleted from localStorage')
      }

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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl shadow-[0_8px_48px_-4px_rgba(0,0,0,0.6),0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl before:bg-gradient-to-br before:from-white/12 before:to-transparent before:opacity-50 before:pointer-events-none">
        <div className="relative z-10 p-5 sm:p-7">
          <div className="flex justify-between items-center mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Edit Persona</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-all duration-400 ease-premium hover:scale-110 hover:rotate-90 text-2xl sm:text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2.5 tracking-wide">
                Persona Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Albert Einstein, My Life Coach, Tech Expert"
                className="w-full bg-black border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:border-white/50 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.5),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium font-light tracking-wide"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2.5 tracking-wide">
                Description <span className="text-red-400">*</span>
              </label>
              <p className="text-sm text-white/60 mb-2.5 font-light tracking-wide">
                Short description (max 2 words) shown on the persona card
              </p>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Physics Genius, Life Coach, Tech Expert"
                maxLength={50}
                className="w-full bg-black border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:border-white/50 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.5),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium font-light tracking-wide"
              />
            </div>

            {/* Avatar URL Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2.5 tracking-wide">
                Avatar Image URL <span className="text-white/50">(Optional)</span>
              </label>
              <p className="text-sm text-white/60 mb-2.5 font-light tracking-wide">
                Link to an image for the persona card
              </p>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:border-white/50 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.5),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium font-light tracking-wide"
              />
              <p className="text-xs text-white/50 mt-2.5 font-light tracking-wide">
                Tip: Use a direct image URL (jpg, png, etc.). Leave blank to use initials.
              </p>
            </div>

            {/* System Prompt Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2.5 tracking-wide">
                System Prompt <span className="text-red-400">*</span>
              </label>
              <p className="text-sm text-white/60 mb-2.5 font-light tracking-wide">
                Define how this persona should behave and respond
              </p>
              <textarea
                required
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Example: You are Albert Einstein. Respond with wisdom about physics, curiosity about the universe, and occasional humor. Keep responses thoughtful and encouraging. Reference relativity and scientific thinking when relevant."
                rows={8}
                className="w-full bg-black border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:border-white/50 focus:outline-none resize-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.5),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-400 ease-premium font-light tracking-wide leading-relaxed"
              />
              <p className="text-xs text-white/50 mt-2.5 font-light tracking-wide">
                Tip: Be specific about personality, knowledge areas, and response style
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.description || !formData.systemPrompt}
                className="group relative flex-1 bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 text-white font-semibold px-6 py-3.5 rounded-full hover:from-white/25 hover:via-white/18 hover:to-white/12 hover:border-white/45 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[0_6px_32px_-2px_rgba(0,0,0,0.5),0_4px_12px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-400 ease-premium disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <span className="relative z-10 tracking-wide">{loading ? 'Updating...' : 'Update Persona'}</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="group relative px-6 py-3.5 bg-gradient-to-br from-red-500/20 via-red-500/15 to-red-500/10 backdrop-blur-xl border border-red-500/40 text-red-200 font-semibold rounded-full hover:from-red-500/30 hover:via-red-500/25 hover:to-red-500/20 hover:border-red-500/60 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_32px_-2px_rgba(239,68,68,0.4)] transition-all duration-400 ease-premium disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <span className="relative z-10 tracking-wide">Delete</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="group relative px-7 py-3.5 bg-white/8 backdrop-blur-xl border border-white/20 text-white rounded-full hover:bg-white/15 hover:border-white/35 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-400 ease-premium overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 tracking-wide font-medium">Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
