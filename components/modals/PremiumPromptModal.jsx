import { useRouter } from 'next/router'

const REASONS = {
  messages: {
    title: "You've reached your 100 message limit!",
    subtitle: 'Upgrade for unlimited conversations',
  },
  personas: {
    title: "You've unlocked 5 personas — that's the free limit!",
    subtitle: 'Upgrade to chat with all personas',
  },
  createPersona: {
    title: 'Create Custom Personas — Premium Feature',
    subtitle: 'Design your own AI characters with Premium',
  },
}

export default function PremiumPromptModal({ isOpen, onClose, reason = 'messages' }) {
  const router = useRouter()
  if (!isOpen) return null

  const { title, subtitle } = REASONS[reason] || REASONS.messages

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
          <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-black mb-4 text-center">Premium Benefits</h3>
          <ul className="space-y-3 text-sm">
            {[
              ['Unlimited messages', 'with all personas'],
              ['Access to all personas', 'no restrictions'],
              ['Create custom personas', 'tailored to your needs'],
              ['Priority AI responses', 'faster processing'],
            ].map(([strong, rest]) => (
              <li key={strong} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700"><strong className="text-black">{strong}</strong> {rest}</span>
              </li>
            ))}
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

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all duration-200"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an account? Sign in to restore your access
        </p>
      </div>
    </div>
  )
}
