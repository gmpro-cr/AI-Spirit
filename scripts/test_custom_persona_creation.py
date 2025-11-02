#!/usr/bin/env python3
"""
Test custom persona creation on production site.
Tests both scenarios:
1. Creating persona WITHOUT avatar URL (should auto-generate)
2. Creating persona WITH avatar URL (should use custom image)
"""

from playwright.sync_api import sync_playwright
import time

def test_custom_persona_creation():
    print("🧪 Testing Custom Persona Creation on Production\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        context = browser.new_context()
        page = context.new_page()

        try:
            # Step 1: Navigate to sign-in page
            print("1️⃣ Navigating to sign-in page...")
            page.goto('https://esperit-ai.vercel.app/auth/signin')
            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/signin-page.png')
            print("✅ Sign-in page loaded")

            # Step 2: Wait for user to sign in manually
            print("\n2️⃣ Please sign in with Google in the browser window...")
            print("   Waiting for redirect to personas page...")

            # Wait for navigation to personas page (or home)
            page.wait_for_url('**/personas', timeout=120000)  # 2 minutes for manual login
            page.wait_for_load_state('networkidle')
            print("✅ Signed in successfully!")

            # Take screenshot of personas page
            page.screenshot(path='/tmp/personas-page.png', full_page=True)

            # Step 3: Click "Create Custom Persona" button
            print("\n3️⃣ Looking for 'Create Custom Persona' button...")

            # Try multiple selectors
            create_button = None
            selectors = [
                'text="Create Custom Persona"',
                'button:has-text("Create")',
                'text="Create"'
            ]

            for selector in selectors:
                try:
                    create_button = page.locator(selector).first
                    if create_button.is_visible():
                        print(f"   Found button with selector: {selector}")
                        break
                except:
                    continue

            if create_button and create_button.is_visible():
                create_button.click()
                page.wait_for_timeout(1000)  # Wait for modal to open
                print("✅ Clicked 'Create Custom Persona' button")
            else:
                print("❌ Could not find 'Create Custom Persona' button")
                print("   Available buttons:")
                buttons = page.locator('button').all()
                for btn in buttons[:10]:
                    try:
                        print(f"   - {btn.text_content()[:50]}")
                    except:
                        pass
                raise Exception("Create button not found")

            # Step 4: Fill in the form (WITHOUT avatar URL)
            print("\n4️⃣ Filling in persona form (Test 1: No avatar URL)...")

            # Wait for modal to be visible
            page.wait_for_selector('input[placeholder*="Albert Einstein"]', timeout=5000)

            # Fill in name
            name_input = page.locator('input[placeholder*="Albert Einstein"]')
            name_input.fill('Test Persona Auto Avatar')
            print("   ✅ Name: Test Persona Auto Avatar")

            # Fill in description
            desc_input = page.locator('input[placeholder*="Physics Genius"]')
            desc_input.fill('Test Description')
            print("   ✅ Description: Test Description")

            # Skip avatar URL (leave blank to test auto-generation)
            print("   ⏭️  Avatar URL: (empty - testing auto-generation)")

            # Fill in system prompt
            prompt_textarea = page.locator('textarea[placeholder*="You are Albert Einstein"]')
            prompt_textarea.fill('You are a test persona. Respond helpfully and test that the system works correctly.')
            print("   ✅ System Prompt: (filled)")

            # Take screenshot before submit
            page.screenshot(path='/tmp/form-filled-test1.png', full_page=True)

            # Step 5: Submit the form
            print("\n5️⃣ Submitting form...")
            submit_button = page.locator('button:has-text("Create Persona")').first
            submit_button.click()

            # Wait for success alert or error
            page.wait_for_timeout(2000)

            # Check for alert dialogs
            print("   Waiting for success/error message...")
            page.wait_for_timeout(1000)

            # Take screenshot after submit
            page.screenshot(path='/tmp/after-submit-test1.png', full_page=True)
            print("✅ Form submitted (Test 1)")

            # Step 6: Test with custom avatar URL
            print("\n6️⃣ Testing with custom avatar URL (Test 2)...")
            page.wait_for_timeout(2000)

            # Click create button again
            create_button = page.locator('text="Create Custom Persona"').first
            if create_button.is_visible():
                create_button.click()
                page.wait_for_timeout(1000)

                # Fill form with custom avatar
                name_input = page.locator('input[placeholder*="Albert Einstein"]')
                name_input.fill('Test Persona Custom Avatar')

                desc_input = page.locator('input[placeholder*="Physics Genius"]')
                desc_input.fill('Custom Avatar Test')

                # Add custom avatar URL
                avatar_input = page.locator('input[type="url"]')
                avatar_input.fill('https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg')
                print("   ✅ Avatar URL: Elon Musk Wikipedia photo")

                prompt_textarea = page.locator('textarea[placeholder*="You are Albert Einstein"]')
                prompt_textarea.fill('You are a test persona with a custom avatar image.')

                # Submit
                page.screenshot(path='/tmp/form-filled-test2.png', full_page=True)
                submit_button = page.locator('button:has-text("Create Persona")').first
                submit_button.click()
                page.wait_for_timeout(2000)
                page.screenshot(path='/tmp/after-submit-test2.png', full_page=True)
                print("✅ Form submitted (Test 2)")

            # Step 7: Check console for errors
            print("\n7️⃣ Checking browser console...")
            console_messages = []

            def handle_console(msg):
                console_messages.append(f"[{msg.type}] {msg.text}")

            page.on('console', handle_console)
            page.wait_for_timeout(2000)

            if console_messages:
                print("   Console messages:")
                for msg in console_messages[-10:]:
                    print(f"   {msg}")
            else:
                print("   No console messages")

            # Final screenshot
            print("\n8️⃣ Taking final screenshot...")
            page.screenshot(path='/tmp/final-state.png', full_page=True)

            print("\n✅ Test completed!")
            print("\nScreenshots saved:")
            print("   - /tmp/signin-page.png")
            print("   - /tmp/personas-page.png")
            print("   - /tmp/form-filled-test1.png (auto avatar)")
            print("   - /tmp/after-submit-test1.png")
            print("   - /tmp/form-filled-test2.png (custom avatar)")
            print("   - /tmp/after-submit-test2.png")
            print("   - /tmp/final-state.png")

            # Keep browser open for inspection
            print("\nBrowser will stay open for 10 seconds for inspection...")
            page.wait_for_timeout(10000)

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            page.screenshot(path='/tmp/error-state.png', full_page=True)
            print("Error screenshot saved to /tmp/error-state.png")
            raise

        finally:
            browser.close()
            print("\n🏁 Browser closed")

if __name__ == '__main__':
    test_custom_persona_creation()
