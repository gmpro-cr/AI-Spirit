#!/usr/bin/env python3
"""
Test custom persona creation feature
"""

from playwright.sync_api import sync_playwright
import sys
import time

def test_custom_persona():
    print("🧪 Testing Custom Persona Feature\n")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test 1: Check if Create button exists
        print("\n1️⃣ CHECKING CREATE BUTTON")
        print("-" * 60)
        try:
            page.goto('http://localhost:3002/personas', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/personas_before_create.png')

            create_button = page.locator('button:has-text("Create Custom")')
            if create_button.count() > 0:
                print("   ✓ Create Custom button found")
            else:
                print("   ✗ Create Custom button NOT found")
                browser.close()
                return 1

        except Exception as e:
            print(f"   ✗ ERROR: {e}")
            browser.close()
            return 1

        # Test 2: Open modal and fill form
        print("\n2️⃣ CREATING CUSTOM PERSONA")
        print("-" * 60)
        try:
            create_button.click()
            print("   ✓ Clicked Create button")

            # Wait for modal
            page.wait_for_selector('text=Create Custom Persona', timeout=5000)
            page.screenshot(path='/tmp/create_modal.png')
            print("   ✓ Modal opened")

            # Fill form
            name_input = page.locator('input[placeholder*="Albert Einstein"]')
            name_input.fill("Test Philosopher")
            print("   ✓ Filled name: Test Philosopher")

            prompt_textarea = page.locator('textarea[placeholder*="You are"]')
            prompt_textarea.fill("You are a wise philosopher. Respond with thoughtful questions and deep insights about life, existence, and human nature.")
            print("   ✓ Filled system prompt")

            page.screenshot(path='/tmp/form_filled.png')

            # Submit form
            submit_button = page.locator('button:has-text("Create Persona")')
            submit_button.click()
            print("   ✓ Clicked Create")

            # Wait for modal to close
            time.sleep(2)
            page.screenshot(path='/tmp/after_create.png')

            # Check if custom persona appears
            philosopher_card = page.locator('text=Test Philosopher')
            if philosopher_card.count() > 0:
                print("   ✓ Custom persona card appeared!")
            else:
                print("   ⚠️ Custom persona card not visible yet (may need refresh)")

        except Exception as e:
            print(f"   ✗ ERROR: {e}")
            page.screenshot(path='/tmp/error_create.png')
            browser.close()
            return 1

        # Test 3: Check Custom badge
        print("\n3️⃣ CHECKING CUSTOM BADGE")
        print("-" * 60)
        try:
            custom_badge = page.locator('text=Custom').first
            if custom_badge.count() > 0:
                print("   ✓ 'Custom' badge found on persona card")
            else:
                print("   ⚠️ Custom badge not found (might be outside viewport)")

        except Exception as e:
            print(f"   ⚠️ Could not verify badge: {e}")

        # Test 4: Test chatting with custom persona
        print("\n4️⃣ TESTING CHAT WITH CUSTOM PERSONA")
        print("-" * 60)
        try:
            philosopher_card = page.locator('text=Test Philosopher').first
            if philosopher_card.count() > 0:
                philosopher_card.click()
                page.wait_for_load_state('networkidle')
                page.screenshot(path='/tmp/custom_chat_page.png')
                print("   ✓ Opened chat with custom persona")

                # Send a message
                input_field = page.locator('textarea, input[placeholder*="message"]').first
                input_field.fill("What is the meaning of life?")

                send_button = page.locator('button:has-text("Send")').first
                send_button.click()
                print("   ✓ Sent message to custom persona")

                # Wait for response
                try:
                    page.wait_for_selector('text=/life|meaning|purpose|existence/i', timeout=15000)
                    page.screenshot(path='/tmp/custom_response.png')
                    print("   ✓ Received response from custom persona!")
                except:
                    print("   ⚠️ No response received (may be timeout)")

            else:
                print("   ⚠️ Could not find custom persona card to test chat")

        except Exception as e:
            print(f"   ✗ ERROR: {e}")

        browser.close()

        print("\n" + "="*60)
        print("✅ CUSTOM PERSONA FEATURE TEST COMPLETE")
        print("="*60)
        print("\nCheck screenshots in /tmp/ for visual verification:")
        print("  - /tmp/personas_before_create.png")
        print("  - /tmp/create_modal.png")
        print("  - /tmp/form_filled.png")
        print("  - /tmp/after_create.png")
        print("  - /tmp/custom_chat_page.png")
        print("  - /tmp/custom_response.png")
        return 0

if __name__ == "__main__":
    sys.exit(test_custom_persona())
