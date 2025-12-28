import { useRouter } from 'next/router'

export default function SignInPromptModal({ isOpen, onClose }) {
  const router = useRouter()
  if (!isOpen) return null

  const handleSignIn = () => {
    onClose()
    router.push('/auth/signin')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white border-2 border-black rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-black mb-3">
          Enjoying your conversations?
        </h2>
        <p className="text-gray-700 mb-6">
          Sign in to unlock the full experience:
        </p>
        <ul className="mb-6 space-y-3 text-gray-800">
          <li className="flex items-start">
            <span className="text-black font-bold mr-2">✓</span>
            <span>Save your chat history across devices</span>
          </li>
          <li className="flex items-start">
            <span className="text-black font-bold mr-2">✓</span>
            <span>Access personas from anywhere</span>
          </li>
          <li className="flex items-start">
            <span className="text-black font-bold mr-2">✓</span>
            <span>Get personalized recommendations</span>
          </li>
        </ul>
        <button
          onClick={handleSignIn}
          className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Sign In with Google
        </button>

      </div>
    </div>
  )
}
