import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

/**
 * Higher-Order Component (HOC) to protect routes with authentication
 * 
 * Usage:
 * export default withAuth(YourComponent)
 * 
 * Features:
 * - Redirects to sign-in if not authenticated
 * - Preserves intended destination with returnTo parameter
 * - Shows loading state while checking authentication
 */
export function withAuth(Component) {
    return function ProtectedRoute(props) {
        const router = useRouter()
        const { user, loading } = useAuth()

        useEffect(() => {
            if (!loading && !user) {
                // User is not authenticated, redirect to sign-in
                const returnTo = router.asPath
                router.push(`/auth/signin?returnTo=${encodeURIComponent(returnTo)}`)
            }
        }, [user, loading, router])

        // Show loading state while checking authentication
        if (loading) {
            return (
                <div className="min-h-screen bg-white dark:bg-[#0B0B0C] flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
                        <p className="text-gray-600 dark:text-white/60 text-lg">Loading...</p>
                    </div>
                </div>
            )
        }

        // Don't render if not authenticated (will redirect)
        if (!user) {
            return null
        }

        // User is authenticated, render the protected component
        return <Component {...props} />
    }
}
