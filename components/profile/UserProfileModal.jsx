import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UserProfileModal({ isOpen, onClose, user }) {
    const [formData, setFormData] = useState({
        preferredName: '',
        interests: '',
        goals: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Parse interests and goals into arrays
            const interestsArray = formData.interests
                .split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0)

            const goalsArray = formData.goals
                .split(',')
                .map(g => g.trim())
                .filter(g => g.length > 0)

            // Create user profile
            const { error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: user.id,
                    full_name: user.user_metadata?.full_name || '',
                    preferred_name: formData.preferredName,
                    interests: interestsArray,
                    goals: goalsArray
                })

            if (error) {
                console.error('Error creating profile:', error)
                alert('Failed to create profile. Please try again.')
                return
            }

            // Success
            onClose(true) // Pass true to indicate profile was created
        } catch (error) {
            console.error('Error:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                {/* Modal */}
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-black">Welcome to AI-Spirit! 👋</h2>
                        <p className="text-gray-600 mt-2">
                            Let's personalize your experience. Tell us a bit about yourself so our AI personas can remember you.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Preferred Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                What should we call you? *
                            </label>
                            <input
                                type="text"
                                value={formData.preferredName}
                                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                                placeholder="e.g., Raj, Sarah, Alex"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This is how personas will address you in conversations
                            </p>
                        </div>

                        {/* Interests */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                What are your interests? (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.interests}
                                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                placeholder="e.g., AI, Philosophy, Fitness, Music"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Separate multiple interests with commas
                            </p>
                        </div>

                        {/* Goals */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                What are your goals? (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.goals}
                                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                placeholder="e.g., Learn coding, Get fit, Start a business"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Separate multiple goals with commas
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-blue-900">
                                    <p className="font-semibold mb-1">How this helps:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                                        <li>Personas will remember your name across all conversations</li>
                                        <li>They'll reference your interests and goals in discussions</li>
                                        <li>Conversations feel more personal and continuous</li>
                                        <li>You can update this anytime in your profile settings</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || !formData.preferredName}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Profile...' : 'Continue to AI-Spirit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
