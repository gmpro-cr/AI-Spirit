import { useRouter } from 'next/router'

export default function SignInPromptModal({ isOpen, onClose }) {
  const router = useRouter()
  if (!isOpen) return null

  const handleSignIn = () => {
    onClose()
    router.push('/auth/signin')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-xl p-8 max-w-md w-full mx-4 relative animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all duration-300"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-black mb-3">
          Enjoying your conversations?
        </h2>
        <p className="text-gray-500 mb-6">
          Sign in to unlock the full experience:
        </p>
        <ul className="mb-8 space-y-4">
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">Save your chat history across devices</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">Access personas from anywhere</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">Get personalized recommendations</span>
          </li>
        </ul>
        <button
          onClick={handleSignIn}
          className="w-full bg-black text-white py-4 px-4 rounded-2xl font-medium shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
        >
          Sign In with Google
        </button>

      </div>
    </div>
  )
}
