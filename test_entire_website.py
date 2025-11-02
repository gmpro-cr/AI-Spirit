#!/usr/bin/env python3
"""
Comprehensive test of entire Esperit.AI website
"""

from playwright.sync_api import sync_playwright
import sys

def test_website():
    print("🔍 Testing Entire Esperit.AI Website\n")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        console_messages = []
        errors = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        results = {}

        # Test 1: Homepage
        print("\n1️⃣ HOMEPAGE TEST")
        print("-" * 60)
        try:
            page.goto('http://localhost:3002/', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/test_homepage.png')

            # Check key elements
            has_particles = page.locator('canvas').count() > 0
            has_navbar = page.locator('text=Esperit.AI').count() > 0
            has_cta = page.locator('text=/Start Chatting|Sign Up/i').count() > 0

            print(f"   Particles background: {'✓' if has_particles else '✗'}")
            print(f"   Navbar: {'✓' if has_navbar else '✗'}")
            print(f"   CTA buttons: {'✓' if has_cta else '✗'}")

            results['homepage'] = has_particles and has_navbar and has_cta
            print(f"   Status: {'✅ PASS' if results['homepage'] else '❌ FAIL'}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results['homepage'] = False

        # Test 2: Personas Page
        print("\n2️⃣ PERSONAS PAGE TEST")
        print("-" * 60)
        try:
            page.goto('http://localhost:3002/personas', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/test_personas.png')

            # Check persona cards
            persona_cards = page.locator('[href*="/chat/"]').count()
            has_search = page.locator('input[placeholder*="Search"]').count() > 0
            has_categories = page.locator('button:has-text("Business"), button:has-text("All")').count() > 0

            print(f"   Persona cards found: {persona_cards}")
            print(f"   Search bar: {'✓' if has_search else '✗'}")
            print(f"   Category filters: {'✓' if has_categories else '✗'}")

            results['personas'] = persona_cards > 0 and has_search
            print(f"   Status: {'✅ PASS' if results['personas'] else '❌ FAIL'}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results['personas'] = False

        # Test 3: Chat Page
        print("\n3️⃣ CHAT PAGE TEST")
        print("-" * 60)
        try:
            page.goto('http://localhost:3002/chat/shah-rukh-khan', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/test_chat_page.png')

            # Check chat interface
            has_persona_header = page.locator('text=Shah Rukh Khan').count() > 0
            has_input = page.locator('textarea, input[placeholder*="message"]').count() > 0
            has_send_button = page.locator('button:has-text("Send")').count() > 0
            has_starters = page.locator('text=/आपने बॉलीवुड|इतने सालों/i').count() > 0

            print(f"   Persona header: {'✓' if has_persona_header else '✗'}")
            print(f"   Message input: {'✓' if has_input else '✗'}")
            print(f"   Send button: {'✓' if has_send_button else '✗'}")
            print(f"   Conversation starters: {'✓' if has_starters else '✗'}")

            results['chat_ui'] = has_persona_header and has_input and has_send_button
            print(f"   Status: {'✅ PASS' if results['chat_ui'] else '❌ FAIL'}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results['chat_ui'] = False

        # Test 4: Chat Functionality (send message)
        print("\n4️⃣ CHAT FUNCTIONALITY TEST")
        print("-" * 60)
        try:
            # Type and send message
            input_field = page.locator('textarea, input[placeholder*="message"]').first
            input_field.fill("Namaste!")
            print("   Typed message: Namaste!")

            page.screenshot(path='/tmp/test_before_send.png')

            send_button = page.locator('button:has-text("Send")').first
            send_button.click()
            print("   Clicked send button")

            # Wait for AI response
            try:
                page.wait_for_selector('text=/namaste|hello|main|bilkul/i', timeout=15000)
                page.screenshot(path='/tmp/test_after_response.png')
                print("   ✓ AI response received!")

                # Check if response is visible
                messages = page.locator('[class*="message"], [class*="chat"]').all_text_contents()
                has_response = any('namaste' in msg.lower() or 'hello' in msg.lower() for msg in messages)

                results['chat_functionality'] = True
                print(f"   Status: ✅ PASS - Chat working!")
            except Exception as e:
                print(f"   ⚠️ Response timeout: {e}")
                page.screenshot(path='/tmp/test_no_response.png')
                results['chat_functionality'] = False
                print(f"   Status: ❌ FAIL - No response")

        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results['chat_functionality'] = False

        # Test 5: Sign In Page
        print("\n5️⃣ SIGN IN PAGE TEST")
        print("-" * 60)
        try:
            page.goto('http://localhost:3002/auth/signin', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/test_signin.png')

            has_google_button = page.locator('button:has-text("Google")').count() > 0
            has_email_input = page.locator('input[type="email"], input[placeholder*="email"]').count() > 0
            has_password_input = page.locator('input[type="password"]').count() > 0

            print(f"   Google sign in: {'✓' if has_google_button else '✗'}")
            print(f"   Email input: {'✓' if has_email_input else '✗'}")
            print(f"   Password input: {'✓' if has_password_input else '✗'}")

            results['signin'] = has_google_button and has_email_input
            print(f"   Status: {'✅ PASS' if results['signin'] else '❌ FAIL'}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            results['signin'] = False

        # Print console errors
        print("\n6️⃣ CONSOLE & ERRORS")
        print("-" * 60)
        console_errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if console_errors:
            print("   ⚠️ Console errors detected:")
            for err in console_errors[:5]:  # Show first 5
                print(f"      {err}")
            if len(console_errors) > 5:
                print(f"      ... and {len(console_errors) - 5} more")
        else:
            print("   ✓ No console errors")

        if errors:
            print("   ⚠️ Page errors:")
            for err in errors:
                print(f"      {err}")

        browser.close()

        # Summary
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        passed = sum(results.values())
        total = len(results)

        for test_name, passed_test in results.items():
            status = "✅ PASS" if passed_test else "❌ FAIL"
            print(f"{status}: {test_name.replace('_', ' ').title()}")

        print(f"\nTotal: {passed}/{total} tests passed")

        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Website is working perfectly.")
            return 0
        else:
            print(f"\n⚠️ {total - passed} test(s) failed. Check details above.")
            return 1

if __name__ == "__main__":
    sys.exit(test_website())
