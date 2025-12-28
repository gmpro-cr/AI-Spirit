import Head from 'next/head'
import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - AI - Spirit</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 transition-colors px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 transition-colors">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mt-4">Privacy Policy</h1>
            <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to AI - Spirit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 mb-2">We collect and process the following information:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> When you sign up using Google OAuth, we collect your name, email address, and profile picture.</li>
                <li><strong>Chat Data:</strong> Your conversations with AI personas, including messages you send and receive.</li>
                <li><strong>Usage Data:</strong> Information about how you use our service, including page views, features used, and interaction patterns.</li>
                <li><strong>Device Information:</strong> IP address, browser type, and device information for security and analytics purposes.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and maintain our AI persona chat service</li>
                <li>Personalize your experience and save your conversation history</li>
                <li>Improve our service and develop new features</li>
                <li>Communicate with you about service updates and support</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-700">
                Your data is stored securely using Supabase, a trusted database provider. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="text-gray-700 mt-2">
                Conversations are encrypted in transit using HTTPS and at rest in our database.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700 mb-2">We use the following third-party services:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Google OAuth:</strong> For authentication (Google&apos;s Privacy Policy applies)</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Google Gemini AI:</strong> For generating AI persona responses</li>
                <li><strong>Vercel:</strong> For hosting and deployment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Export your conversation history</li>
                <li>Withdraw consent for data processing</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal data only for as long as necessary to provide our services and comply with legal obligations. You can delete your account and all associated data at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                  Contact Form
                </Link>
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <Link href="/terms" className="hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-gray-900">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
