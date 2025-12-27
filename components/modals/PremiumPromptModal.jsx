import { useRouter } from 'next/router'

export default function PremiumPromptModal({ isOpen, onClose }) {
  const router = useRouter()
  if (!isOpen) return null

  const handleUpgradeToPremium = () => {
    onClose()
    router.push('/premium')
  }

  const handleSignIn = () => {
    onClose()
    router.push('/auth/signin')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white dark:bg-spirit-bg-secondary-dark border-2 border-black rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-black dark:text-spirit-primary-dark mb-2">
            You&apos;ve reached your 50 message limit!
          </h2>
          <p className="text-gray-700">
            Time to unlock unlimited access
          </p>
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5 mb-6">
          <h3 className="font-bold text-black dark:text-spirit-primary-dark mb-3 text-center">Premium Benefits</h3>
          <ul className="space-y-2 text-gray-800 text-sm">
            <li className="flex items-start">
              <span className="text-black dark:text-spirit-primary-dark font-bold mr-2">✓</span>
              <span><strong>Unlimited messages</strong> with all personas</span>
            </li>
            <li className="flex items-start">
              <span className="text-black dark:text-spirit-primary-dark font-bold mr-2">✓</span>
              <span><strong>Priority responses</strong> - faster AI processing</span>
            </li>
            <li className="flex items-start">
              <span className="text-black dark:text-spirit-primary-dark font-bold mr-2">✓</span>
              <span><strong>Chat history</strong> synced across devices</span>
            </li>
            <li className="flex items-start">
              <span className="text-black dark:text-spirit-primary-dark font-bold mr-2">✓</span>
              <span><strong>Create custom personas</strong> tailored to your needs</span>
            </li>
            <li className="flex items-start">
              <span className="text-black dark:text-spirit-primary-dark font-bold mr-2">✓</span>
              <span><strong>Early access</strong> to new features</span>
            </li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-black dark:text-spirit-primary-dark mb-1">₹499/month</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancel anytime, no questions asked</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgradeToPremium}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={handleSignIn}
            className="w-full bg-gray-100 text-black dark:text-spirit-primary-dark border-2 border-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
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
