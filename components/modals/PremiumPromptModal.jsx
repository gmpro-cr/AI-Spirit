import { useRouter } from 'next/router'
import { dismissPremiumPrompt } from '@/lib/guestMessageTracking'

export default function PremiumPromptModal({ isOpen, onClose }) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUpgradeToPremium = () => {
    onClose()
    router.push('/premium')
  }

  const handleSignIn = () => {
    onClose()
    router.push('/signin')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You've reached your limit!
          </h2>
          <p className="text-gray-600">
            You've sent 50 messages. Time to unlock unlimited access!
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Premium Benefits:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Unlimited messages</strong> with all personas</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Priority responses</strong> - faster AI processing</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Chat history</strong> synced across devices</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Create custom personas</strong> tailored to your needs</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Early access</strong> to new features</span>
            </li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">₹499/month</div>
          <p className="text-sm text-gray-600">Cancel anytime, no questions asked</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgradeToPremium}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upgrade to Premium
          </button>

          <button
            onClick={handleSignIn}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Sign In (Already Premium?)
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Already have an account? Sign in to continue chatting
        </p>
      </div>
    </div>
  )
}
