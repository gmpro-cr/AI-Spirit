#!/usr/bin/env python3
"""
Detailed chat functionality test with error logging
"""

from playwright.sync_api import sync_playwright
import sys

def test_chat_detailed():
    print("🔍 DETAILED CHAT FUNCTIONALITY TEST\n")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture all console messages and errors
        console_logs = []
        page_errors = []
        network_errors = []

        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("requestfailed", lambda req: network_errors.append(f"{req.method} {req.url} - {req.failure}"))

        try:
            # Step 1: Navigate to personas page
            print("\n1️⃣ NAVIGATING TO PERSONAS PAGE")
            print("-" * 60)
            page.goto('http://localhost:3002/personas', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/debug_personas.png')
            print("   ✓ Personas page loaded")

            # Step 2: Click on a persona
            print("\n2️⃣ SELECTING PERSONA")
            print("-" * 60)

            # Try Shah Rukh Khan first
            srk_card = page.locator('text=Shah Rukh Khan').first
            if srk_card.count() > 0:
                print("   Found: Shah Rukh Khan")
                srk_card.click()
            else:
                # Fallback to any persona
                print("   Shah Rukh Khan not found, trying first available persona...")
                first_card = page.locator('a[href*="/chat/"]').first
                if first_card.count() > 0:
                    first_card.click()
                else:
                    print("   ✗ NO PERSONA CARDS FOUND!")
                    browser.close()
                    return 1

            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/debug_chat_page.png')
            print("   ✓ Chat page opened")

            # Step 3: Check chat interface elements
            print("\n3️⃣ VERIFYING CHAT INTERFACE")
            print("-" * 60)

            chat_input = page.locator('textarea').first
            if chat_input.count() == 0:
                print("   ✗ CHAT INPUT NOT FOUND!")
                print(f"   Page URL: {page.url}")

                # Debug: Print page content structure
                print("\n   DEBUG: Page structure")
                main_content = page.locator('main').first
                if main_content.count() > 0:
                    print(f"   Main element exists")
                else:
                    print(f"   Main element MISSING")

                browser.close()
                return 1

            print("   ✓ Chat input found")

            send_button = page.locator('button:has-text("Send")').first
            if send_button.count() == 0:
                print("   ✗ SEND BUTTON NOT FOUND!")
            else:
                print("   ✓ Send button found")

            # Step 4: Send message
            print("\n4️⃣ SENDING MESSAGE")
            print("-" * 60)

            chat_input.fill("Hello, testing!")
            print("   ✓ Typed message")
            page.screenshot(path='/tmp/debug_before_send.png')

            send_button.click()
            print("   ✓ Clicked send")

            # Step 5: Wait for response
            print("\n5️⃣ WAITING FOR AI RESPONSE")
            print("-" * 60)

            # Wait up to 15 seconds for any text response
            import time
            time.sleep(3)  # Give it time to send
            page.screenshot(path='/tmp/debug_after_send.png')

            # Check if there are any message elements
            messages = page.locator('[class*="message"], div[class*="bg-"], p').all_text_contents()

            # Look for common AI response patterns
            has_response = False
            for msg in messages:
                if len(msg) > 20 and ('hello' in msg.lower() or 'namaste' in msg.lower() or 'hi' in msg.lower()):
                    has_response = True
                    print(f"   ✓ RESPONSE FOUND: {msg[:100]}...")
                    break

            if not has_response:
                print("   ⚠️ NO CLEAR AI RESPONSE DETECTED")
                print(f"   Total text elements: {len(messages)}")
                print("   First few elements:")
                for i, msg in enumerate(messages[:5]):
                    if msg.strip():
                        print(f"      [{i}] {msg[:80]}")

            page.screenshot(path='/tmp/debug_final.png')

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            page.screenshot(path='/tmp/debug_error.png')

        finally:
            # Print all console logs
            print("\n6️⃣ CONSOLE LOGS")
            print("-" * 60)
            if console_logs:
                errors = [log for log in console_logs if 'error' in log.lower()]
                warnings = [log for log in console_logs if 'warning' in log.lower()]

                if errors:
                    print(f"   ⚠️ {len(errors)} errors:")
                    for err in errors[:5]:
                        print(f"      {err}")

                if warnings:
                    print(f"   ⚠️ {len(warnings)} warnings:")
                    for warn in warnings[:3]:
                        print(f"      {warn}")

                if not errors and not warnings:
                    print("   ✓ No errors or warnings")
            else:
                print("   (No console logs)")

            # Print page errors
            if page_errors:
                print("\n7️⃣ PAGE ERRORS")
                print("-" * 60)
                for err in page_errors:
                    print(f"   ✗ {err}")

            # Print network errors
            if network_errors:
                print("\n8️⃣ NETWORK ERRORS")
                print("-" * 60)
                for err in network_errors[:5]:
                    print(f"   ✗ {err}")

            browser.close()

        print("\n" + "="*60)
        print("CHECK SCREENSHOTS:")
        print("  /tmp/debug_personas.png")
        print("  /tmp/debug_chat_page.png")
        print("  /tmp/debug_before_send.png")
        print("  /tmp/debug_after_send.png")
        print("  /tmp/debug_final.png")
        print("="*60)

        return 0

if __name__ == "__main__":
    sys.exit(test_chat_detailed())
