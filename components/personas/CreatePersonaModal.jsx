import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function CreatePersonaModal({ isOpen, onClose, onPersonaCreated }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    systemPrompt: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields (Name, Description, and System Prompt)')
      return
    }

    setLoading(true)

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const newPersona = {
        name: formData.name,
        slug: `custom-${slug}-${Date.now()}`,
        category: 'Custom',
        description: formData.description,
        avatar_url: formData.avatarUrl || null,
        system_prompt: formData.systemPrompt,
        language: 'en',
        is_custom: true,
        created_at: new Date().toISOString()
      }

      // Save to database for authenticated users
      if (user) {
        console.log('Saving to database for authenticated user')

        // Generate default avatar URL if none provided
        const avatarUrl = formData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=400&background=4F46E5&color=fff&bold=true&format=png`

        // Generate bio from system prompt (required field)
        const bio = formData.systemPrompt.length > 200
          ? formData.systemPrompt.substring(0, 200) + '...'
          : formData.systemPrompt

        const { data, error } = await supabase
          .from('personas')
          .insert({
            name: newPersona.name,
            slug: newPersona.slug,
            category: newPersona.category,
            short_description: newPersona.description,
            bio: bio,
            avatar_url: avatarUrl,
            system_prompt: newPersona.system_prompt,
            is_custom: true,
            user_id: user.id
          })
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          throw new Error(`Database error: ${error.message}`)
        }

        console.log('Persona saved to database:', data)
        onPersonaCreated(data)
      } else {
        // Save to localStorage for guest users
        console.log('Saving to localStorage for guest user')

        const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
        customPersonas.push(newPersona)
        localStorage.setItem('esperit_custom_personas', JSON.stringify(customPersonas))
        console.log('Persona saved to localStorage:', newPersona)

        onPersonaCreated(newPersona)
      }

      // Reset form and close
      setFormData({ name: '', description: '', avatarUrl: '', systemPrompt: '' })
      alert('Persona created successfully!')
      onClose()
    } catch (error) {
      console.error('Error creating persona:', error)
      alert(`Failed to create persona: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/4 backdrop-blur-2xl border border-white/25 rounded-2xl sm:rounded-3xl shadow-[0_8px_48px_-4px_rgba(0,0,0,0.6),0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl before:bg-gradient-to-br before:from-white/12 before:to-transparent before:opacity-50 before:pointer-events-none">
        <div className="relative z-10 p-5 sm:p-7">
          <div className="flex justify-between items-center mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Custom Persona</h2>
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
                className="w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:from-white/22 focus:via-white/16 focus:to-white/12 focus:border-white/40 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-400 ease-premium font-light tracking-wide"
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
                className="w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:from-white/22 focus:via-white/16 focus:to-white/12 focus:border-white/40 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-400 ease-premium font-light tracking-wide"
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
                className="w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:from-white/22 focus:via-white/16 focus:to-white/12 focus:border-white/40 focus:outline-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-400 ease-premium font-light tracking-wide"
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
                className="w-full bg-gradient-to-br from-white/15 via-white/10 to-white/8 backdrop-blur-xl border border-white/30 rounded-3xl px-5 py-3.5 text-white placeholder-white/50 focus:from-white/22 focus:via-white/16 focus:to-white/12 focus:border-white/40 focus:outline-none resize-none shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] focus:shadow-[0_6px_24px_-2px_rgba(0,0,0,0.4),0_2px_8px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-400 ease-premium font-light tracking-wide leading-relaxed"
              />
              <p className="text-xs text-white/50 mt-2.5 font-light tracking-wide">
                Tip: Be specific about personality, knowledge areas, and response style
              </p>
            </div>

            {/* Info Box */}
            <div className="relative bg-white/6 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-50 before:pointer-events-none">
              <p className="relative z-10 text-sm text-white/70 font-light tracking-wide">
                ⚠️ Your custom persona will be saved to this browser only (localStorage). Database sync is not yet enabled.
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
                <span className="relative z-10 tracking-wide">{loading ? 'Creating...' : 'Create Persona'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
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
