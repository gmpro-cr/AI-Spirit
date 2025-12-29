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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-xl p-8 max-w-md w-full mx-4 animate-scaleIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            You&apos;ve reached your 50 message limit!
          </h2>
          <p className="text-gray-500">
            Time to unlock unlimited access
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-black mb-4 text-center">Premium Benefits</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700"><strong className="text-black">Unlimited messages</strong> with all personas</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700"><strong className="text-black">Priority responses</strong> - faster AI processing</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700"><strong className="text-black">Chat history</strong> synced across devices</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700"><strong className="text-black">Create custom personas</strong> tailored to your needs</span>
            </li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-black mb-1">₹499/month</div>
          <p className="text-sm text-gray-500">Cancel anytime, no questions asked</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgradeToPremium}
            className="w-full bg-black text-white py-4 px-4 rounded-2xl font-medium shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={handleSignIn}
            className="w-full bg-gray-50 text-black border border-gray-200 py-4 px-4 rounded-2xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
          >
            Sign In (Already Premium?)
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an account? Sign in to continue chatting
        </p>
      </div>
    </div>
  )
}
