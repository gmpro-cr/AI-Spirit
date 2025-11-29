import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function CreatePersonaModal({ isOpen, onClose, onPersonaCreated }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatarUrl: '',
    systemPrompt: ''
  })

  if (!isOpen) return null

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }

      setUploadedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData({ ...formData, avatarUrl: '' }) // Clear URL if image is uploaded
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('=== CREATE PERSONA SUBMIT STARTED ===')
    console.log('Form data:', formData)
    console.log('Uploaded image:', uploadedImage?.name)
    console.log('Image preview length:', imagePreview?.length)
    console.log('User:', user)

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      alert('Please fill in all required fields (Name, Description, and System Prompt)')
      return
    }

    setLoading(true)

    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // Use uploaded image preview or URL, or generate default avatar
      const avatarUrl = imagePreview || formData.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=400&background=4F46E5&color=fff&bold=true&format=png`

      console.log('Generated avatar URL:', avatarUrl?.substring(0, 100) + '...')

      // Generate bio from system prompt (required field)
      const bio = formData.systemPrompt.length > 200
        ? formData.systemPrompt.substring(0, 200) + '...'
        : formData.systemPrompt

      // Save to database for ALL users (authenticated and guest)
      console.log(user ? 'Saving to database for authenticated user' : 'Saving to database for guest user')

      const personaData = {
        name: formData.name,
        slug: `custom-${slug}-${Date.now()}`,
        category: 'Custom',
        short_description: formData.description,
        bio: bio,
        avatar_url: avatarUrl,
        system_prompt: formData.systemPrompt,
        is_custom: true,
        user_id: user?.id || null  // null for guest users
      }

      console.log('Persona data to insert:', {
        ...personaData,
        avatar_url: personaData.avatar_url?.substring(0, 100) + '...',
        system_prompt: personaData.system_prompt?.substring(0, 50) + '...'
      })

      const { data, error } = await supabase
        .from('personas')
        .insert(personaData)
        .select()
        .single()

      if (error) {
        console.error('❌ Database error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('✅ Persona saved to database:', data)

      // Also save to localStorage for guest users as backup
      if (!user) {
        try {
          const newPersona = {
            ...personaData,
            created_at: new Date().toISOString()
          }
          const customPersonas = JSON.parse(localStorage.getItem('esperit_custom_personas') || '[]')
          customPersonas.push(newPersona)
          localStorage.setItem('esperit_custom_personas', JSON.stringify(customPersonas))
          console.log('✅ Persona also saved to localStorage backup')
        } catch (localStorageError) {
          console.error('⚠️ localStorage save failed:', localStorageError)
        }
      }

      if (onPersonaCreated) {
        onPersonaCreated(data)
      }

      // Reset form and close
      setFormData({ name: '', description: '', avatarUrl: '', systemPrompt: '' })
      setUploadedImage(null)
      setImagePreview('')
      alert('Persona created successfully!')
      onClose()
    } catch (error) {
      console.error('❌ Error creating persona:', error)
      console.error('Error stack:', error.stack)
      alert(`Failed to create persona: ${error.message || 'Unknown error'}. Check console for details.`)
    } finally {
      setLoading(false)
      console.log('=== CREATE PERSONA SUBMIT ENDED ===')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="relative z-10 p-5 sm:p-7">
          <div className="flex justify-between items-center mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create Custom Persona</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 hover:rotate-90 text-2xl sm:text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                Persona Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Albert Einstein, My Life Coach, Tech Expert"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                Description <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2.5">
                Short description (max 2 words) shown on the persona card
              </p>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Physics Genius, Life Coach, Tech Expert"
                maxLength={50}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
              />
            </div>

            {/* Avatar Image Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                Avatar Image <span className="text-gray-500">(Optional)</span>
              </label>
              <p className="text-sm text-gray-500 mb-2.5">
                Upload an image or provide a URL
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="mb-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer transition-all font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {uploadedImage ? uploadedImage.name : 'Max 5MB'}
                </span>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* URL Input */}
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => {
                  setFormData({ ...formData, avatarUrl: e.target.value })
                  if (e.target.value) {
                    setUploadedImage(null)
                    setImagePreview('')
                  }
                }}
                placeholder="https://example.com/image.jpg"
                disabled={!!uploadedImage}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2.5">
                Tip: Upload an image or paste a direct image URL. Leave blank to use initials.
              </p>
            </div>

            {/* System Prompt Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">
                System Prompt <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2.5">
                Define how this persona should behave and respond
              </p>
              <textarea
                required
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Example: You are Albert Einstein. Respond with wisdom about physics, curiosity about the universe, and occasional humor. Keep responses thoughtful and encouraging. Reference relativity and scientific thinking when relevant."
                rows={8}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none transition-all leading-relaxed"
              />
              <p className="text-xs text-gray-500 mt-2.5">
                Tip: Be specific about personality, knowledge areas, and response style
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {user ? (
                  <>✅ Your custom persona will be saved to the database and synced across all your devices.</>
                ) : (
                  <>✅ Your custom persona will be saved to the database. Sign in to link it to your account for cross-device sync.</>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.description || !formData.systemPrompt}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Creating...' : 'Create Persona'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-7 py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
