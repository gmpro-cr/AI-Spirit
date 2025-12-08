import { useRouter } from 'next/router'
import { dismissSignInPrompt } from '@/lib/guestMessageTracking'

export default function SignInPromptModal({ isOpen, onClose }) {
  const router = useRouter()

  if (!isOpen) return null

  const handleSignIn = () => {
    onClose()
    router.push('/signin')
  }

  const handleContinueAsGuest = () => {
    dismissSignInPrompt()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Enjoying your conversations?
        </h2>

        <p className="text-gray-600 mb-6">
          You've sent 10 messages! Sign in to unlock:
        </p>

        <ul className="mb-6 space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Save your chat history across devices</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Access personas from anywhere</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✓</span>
            <span>Get personalized recommendations</span>
          </li>
        </ul>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In to Continue
          </button>

          <button
            onClick={handleContinueAsGuest}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}
