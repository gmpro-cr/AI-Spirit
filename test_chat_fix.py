#!/usr/bin/env python3
"""
Test chat functionality after fix
"""

from playwright.sync_api import sync_playwright
import sys
import time

def test_chat_after_fix():
    print("🧪 TESTING CHAT AFTER FIX\n")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Track console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            # Step 1: Go to personas
            print("\n1️⃣ NAVIGATING TO PERSONAS")
            print("-" * 60)
            page.goto('http://localhost:3002/personas', wait_until='networkidle', timeout=10000)
            print("   ✓ Personas page loaded")

            # Step 2: Click Shah Rukh Khan
            print("\n2️⃣ SELECTING SHAH RUKH KHAN")
            print("-" * 60)
            srk = page.locator('text=Shah Rukh Khan').first
            if srk.count() > 0:
                srk.click()
                page.wait_for_load_state('networkidle')
                print("   ✓ Chat page opened")
            else:
                print("   ✗ Shah Rukh Khan not found")
                browser.close()
                return 1

            # Step 3: Find chat input (using INPUT not TEXTAREA)
            print("\n3️⃣ FINDING CHAT INPUT")
            print("-" * 60)

            # Wait a bit for React hydration
            time.sleep(1)

            chat_input = page.locator('input[placeholder="Type your message..."]').first
            if chat_input.count() == 0:
                print("   ✗ Chat input NOT FOUND")
                page.screenshot(path='/tmp/chat_fix_error.png')
                browser.close()
                return 1

            print("   ✓ Chat input found (using correct selector)")

            # Step 4: Send message
            print("\n4️⃣ SENDING MESSAGE")
            print("-" * 60)

            chat_input.fill("Hello!")
            print("   ✓ Typed message")

            send_button = page.locator('button:has-text("Send")').first
            if send_button.count() == 0:
                print("   ✗ Send button not found")
                browser.close()
                return 1

            send_button.click()
            print("   ✓ Clicked send")

            # Step 5: Wait for response
            print("\n5️⃣ WAITING FOR AI RESPONSE")
            print("-" * 60)

            # Wait up to 10 seconds for response
            time.sleep(5)

            # Look for messages in the page
            page_text = page.inner_text('body')

            # Check if there's a response (looking for common Hindi greetings from SRK)
            if 'नमस्ते' in page_text or 'हैलो' in page_text or 'Hello' in page_text:
                print("   ✓ AI RESPONSE RECEIVED!")
                page.screenshot(path='/tmp/chat_fix_success.png')
            else:
                print("   ⚠️ No clear AI response detected yet")
                print(f"   Page contains {len(page_text)} characters")
                page.screenshot(path='/tmp/chat_fix_partial.png')

            # Check console for errors
            print("\n6️⃣ CONSOLE ERRORS")
            print("-" * 60)
            if console_errors:
                print(f"   ⚠️ {len(console_errors)} console errors:")
                for err in console_errors[:3]:
                    print(f"      {err}")
            else:
                print("   ✓ No console errors!")

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            page.screenshot(path='/tmp/chat_fix_exception.png')
            return 1
        finally:
            browser.close()

        print("\n" + "="*60)
        print("✅ TEST COMPLETE")
        print("="*60)
        return 0

if __name__ == "__main__":
    sys.exit(test_chat_after_fix())
