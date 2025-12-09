'use client'

import CookieConsent from 'react-cookie-consent'
import Link from 'next/link'

export default function CookieConsentBanner() {
    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept"
            declineButtonText="Decline"
            enableDeclineButton
            cookieName="ai-spirit-consent"
            style={{
                background: '#000000',
                padding: '16px 24px',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 9999,
            }}
            buttonStyle={{
                background: '#ffffff',
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600',
                padding: '10px 24px',
                borderRadius: '9999px',
                cursor: 'pointer',
            }}
            declineButtonStyle={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '10px 24px',
                borderRadius: '9999px',
                cursor: 'pointer',
                marginRight: '12px',
            }}
            expires={365}
            onAccept={() => {
                // Enable analytics after consent
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('consent', 'update', {
                        analytics_storage: 'granted',
                    })
                }
            }}
            onDecline={() => {
                // Keep analytics disabled
                if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('consent', 'update', {
                        analytics_storage: 'denied',
                    })
                }
            }}
        >
            <span style={{ fontSize: '14px', color: '#ffffff' }}>
                We use cookies and local storage to enhance your experience. By continuing, you agree to our{' '}
                <Link
                    href="/privacy"
                    style={{
                        color: '#ffffff',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px'
                    }}
                >
                    Privacy Policy
                </Link>
                .
            </span>
        </CookieConsent>
    )
}
