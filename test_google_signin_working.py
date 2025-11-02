from playwright.sync_api import sync_playwright
import time

def test_google_signin():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        print("=" * 60)
        print("Testing Google Sign-In - AFTER ENABLING")
        print("=" * 60)

        # Navigate to sign-in page
        print("\n1. Navigating to sign-in page...")
        page.goto('http://localhost:3002/auth/signin')
        page.wait_for_load_state('networkidle')

        # Click Google sign-in button
        print("2. Clicking 'Sign in with Google' button...")
        google_button = page.locator('button:has-text("Sign in with Google")').first
        google_button.click()

        # Wait for redirect
        print("3. Waiting for redirect...")
        page.wait_for_timeout(5000)

        # Check where we are
        current_url = page.url
        print(f"\n4. Current URL after clicking: {current_url}")

        # Check if we're on Google's sign-in page
        if 'accounts.google.com' in current_url:
            print("\n✅ SUCCESS! Redirected to Google's sign-in page")
            print("Google OAuth is working correctly!")
        elif 'supabase.co/auth/v1/authorize' in current_url:
            # We're on the Supabase authorize page - check for errors
            page_content = page.content()
            if 'Unsupported provider' in page_content or 'not enabled' in page_content:
                print("\n❌ FAILED! Still getting 'provider not enabled' error")
                print("Page content:", page_content[:500])
            else:
                print("\n⚠️  On Supabase authorize page but no error visible")
                print("This might redirect to Google shortly...")
                page.wait_for_timeout(3000)
                new_url = page.url
                if 'accounts.google.com' in new_url:
                    print("✅ Now redirected to Google!")
                else:
                    print(f"Still on: {new_url}")
        else:
            print(f"\n⚠️  Unexpected URL: {current_url}")
            print("Page title:", page.title())

        # Keep browser open for a bit to see the result
        print("\nKeeping browser open for 5 seconds...")
        page.wait_for_timeout(5000)

        browser.close()
        print("\n" + "=" * 60)

if __name__ == "__main__":
    test_google_signin()
