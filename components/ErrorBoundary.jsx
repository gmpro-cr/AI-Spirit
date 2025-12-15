import React from 'react'
import Link from 'next/link'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    handleRefresh = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        {/* Error Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Error Message */}
                        <h2 className="text-2xl font-bold text-black mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We encountered an unexpected error. Please try again.
                        </p>
                        {/* Debug info */}
                        {this.state.error && (
                            <p className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded break-all">
                                {this.state.error.message || String(this.state.error)}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleRefresh}
                                className="px-6 py-3 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>

                        {/* Back to Home */}
                        <Link
                            href="/"
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="inline-block mt-6 text-sm text-gray-500 hover:text-black transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
