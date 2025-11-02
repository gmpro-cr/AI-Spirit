from playwright.sync_api import sync_playwright

def test_google_signin_click():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text
        }))

        # Capture network errors
        network_errors = []
        page.on('requestfailed', lambda request: network_errors.append({
            'url': request.url,
            'failure': request.failure
        }))

        print("Testing Google Sign-In Click...")
        print("="*60)

        # Navigate to sign-in page
        print("\n1. Navigating to sign-in page...")
        page.goto('http://localhost:3002/auth/signin')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        print("✅ Page loaded")

        # Take before screenshot
        page.screenshot(path='/tmp/before_click.png')
        print("📸 Before click screenshot saved")

        # Find and click Google button
        print("\n2. Clicking Google Sign-In button...")
        try:
            google_button = page.locator('button:has-text("Sign in with Google")').first
            google_button.click()
            print("✅ Clicked Google Sign-In button")

            # Wait for redirect or error
            print("\n3. Waiting for response...")
            page.wait_for_timeout(5000)  # Wait 5 seconds to see what happens

            # Take after screenshot
            page.screenshot(path='/tmp/after_click.png')
            print("📸 After click screenshot saved")

            # Check current URL
            current_url = page.url
            print(f"\n4. Current URL: {current_url}")

            if 'google.com' in current_url or 'accounts.google' in current_url:
                print("✅ Successfully redirected to Google Sign-In")
            elif current_url == 'http://localhost:3002/auth/signin':
                print("❌ Still on sign-in page - no redirect happened")
            else:
                print(f"⚠️  Redirected to unexpected URL: {current_url}")

            # Check for errors
            print("\n5. Checking for errors...")
            if console_messages:
                errors = [msg for msg in console_messages if msg['type'] == 'error']
                if errors:
                    print(f"❌ Found {len(errors)} console error(s):")
                    for error in errors:
                        print(f"   - {error['text']}")
                else:
                    print("✅ No console errors")

            if network_errors:
                print(f"❌ Found {len(network_errors)} network error(s):")
                for error in network_errors[:5]:
                    print(f"   - {error['url']}")
                    print(f"     Failure: {error['failure']}")
            else:
                print("✅ No network errors")

        except Exception as e:
            print(f"❌ Error during test: {e}")
            page.screenshot(path='/tmp/error_screenshot.png')

        print("\n" + "="*60)
        print("Test complete! Check screenshots:")
        print("  - /tmp/before_click.png")
        print("  - /tmp/after_click.png")

        browser.close()

if __name__ == '__main__':
    test_google_signin_click()
