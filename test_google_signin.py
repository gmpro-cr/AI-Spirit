from playwright.sync_api import sync_playwright
import json

def test_google_signin():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text
        }))

        print("Testing Google Sign-In functionality...")
        print("="*60)

        # Navigate to sign-in page
        print("\n1. Navigating to sign-in page...")
        page.goto('http://localhost:3002/auth/signin')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)  # Wait for auth UI to load

        # Take screenshot
        page.screenshot(path='/tmp/signin_page.png', full_page=True)
        print("✅ Sign-in page loaded")
        print("📸 Screenshot saved: /tmp/signin_page.png")

        # Check for Google sign-in button
        print("\n2. Checking for Google sign-in button...")

        # Try multiple possible selectors for the Google button
        google_button_selectors = [
            'button:has-text("Continue with Google")',
            'button:has-text("Sign in with Google")',
            'button:has-text("Google")',
            '[data-provider="google"]',
            'button[name="provider"][value="google"]',
        ]

        google_button = None
        for selector in google_button_selectors:
            try:
                button = page.locator(selector)
                if button.count() > 0:
                    google_button = button.first
                    print(f"✅ Found Google button with selector: {selector}")
                    break
            except Exception as e:
                continue

        if not google_button:
            print("❌ Google sign-in button not found")
            print("\n🔍 Looking for all buttons on the page...")
            buttons = page.locator('button').all()
            print(f"Found {len(buttons)} buttons:")
            for i, btn in enumerate(buttons[:10]):  # Show first 10 buttons
                try:
                    text = btn.text_content()
                    print(f"  Button {i+1}: '{text}'")
                except:
                    pass
        else:
            print(f"✅ Google button text: '{google_button.text_content()}'")

        # Check page HTML for Supabase Auth UI
        print("\n3. Checking page content...")
        page_content = page.content()

        if 'supabase' in page_content.lower():
            print("✅ Supabase Auth UI detected")
        else:
            print("⚠️  Supabase Auth UI may not be loaded")

        # Check for errors in console
        print("\n4. Console messages:")
        if console_messages:
            errors = [msg for msg in console_messages if msg['type'] == 'error']
            warnings = [msg for msg in console_messages if msg['type'] == 'warning']

            if errors:
                print(f"❌ {len(errors)} error(s) found:")
                for error in errors[:5]:  # Show first 5 errors
                    print(f"   - {error['text']}")

            if warnings:
                print(f"⚠️  {len(warnings)} warning(s) found:")
                for warning in warnings[:3]:  # Show first 3 warnings
                    print(f"   - {warning['text']}")

            if not errors and not warnings:
                print("✅ No errors or warnings")
        else:
            print("✅ No console messages")

        # Check network requests
        print("\n5. Checking network activity...")
        requests = []

        def log_request(request):
            requests.append({
                'url': request.url,
                'method': request.method
            })

        page.on('request', log_request)

        # Wait a bit for any delayed requests
        page.wait_for_timeout(1000)

        auth_requests = [r for r in requests if 'auth' in r['url'].lower() or 'google' in r['url'].lower()]
        if auth_requests:
            print(f"✅ Found {len(auth_requests)} auth-related requests")
            for req in auth_requests[:5]:
                print(f"   - {req['method']} {req['url']}")
        else:
            print("⚠️  No auth-related requests found")

        # Check Supabase configuration
        print("\n6. Verifying Supabase client...")
        try:
            supabase_check = page.evaluate('''
                () => {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || window.NEXT_PUBLIC_SUPABASE_URL;
                    return {
                        hasSupabaseURL: !!url,
                        url: url
                    };
                }
            ''')
            if supabase_check.get('hasSupabaseURL'):
                print(f"✅ Supabase URL configured: {supabase_check.get('url')}")
            else:
                print("❌ Supabase URL not found")
        except Exception as e:
            print(f"⚠️  Could not check Supabase config: {e}")

        print("\n" + "="*60)
        print("Testing complete!")

        browser.close()

if __name__ == '__main__':
    test_google_signin()
