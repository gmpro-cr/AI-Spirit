#!/usr/bin/env python3
"""
DEBUG: Persona Creation Flow
Reproduces the issue where newly created persona chat page doesn't open
"""

from playwright.sync_api import sync_playwright
import time

def test_persona_creation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible to see what happens
        page = browser.new_page()

        # Enable console logging to catch errors
        console_messages = []
        errors = []

        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: errors.append(str(err)))

        print("=" * 70)
        print("PHASE 1: ROOT CAUSE INVESTIGATION")
        print("=" * 70)
        print("\n🔍 Step 1: Navigate to personas page\n")

        page.goto('http://localhost:3002/personas', wait_until='networkidle')
        page.wait_for_timeout(2000)

        print("✅ Personas page loaded\n")

        # Check if personas are visible
        existing_personas = page.locator('.glass-panel').count()
        print(f"📊 Found {existing_personas} existing personas\n")

        print("🔍 Step 2: Click Create Persona button\n")

        create_button = page.locator('button:has-text("Create Persona")')
        create_button.click()
        page.wait_for_timeout(1000)

        # Check if modal opened
        modal = page.locator('h2:has-text("Create Custom Persona")')
        if modal.count() > 0:
            print("✅ Create Persona modal opened\n")
        else:
            print("❌ Modal did not open\n")
            browser.close()
            return

        print("🔍 Step 3: Fill in persona details\n")

        # Fill name
        name_input = page.locator('input[placeholder*="Albert Einstein"]')
        name_input.fill("Rakhi Sawant")
        print("   Name: Rakhi Sawant")

        # Fill system prompt
        prompt_textarea = page.locator('textarea[placeholder*="Example:"]')
        prompt_textarea.fill("You are Rakhi Sawant, the drama queen of Bollywood. Respond with sass, drama, and entertainment. Be bold and outspoken.")
        print("   System Prompt: Filled")

        page.wait_for_timeout(500)

        print("\n🔍 Step 4: Submit form\n")

        # Click create button (the one inside the modal form)
        submit_button = page.locator('form button[type="submit"]')
        submit_button.click()

        print("   Form submitted, waiting for response...\n")
        page.wait_for_timeout(3000)

        print("🔍 Step 5: Check if persona was created\n")

        # Check localStorage for custom personas
        local_storage = page.evaluate("""
            () => {
                const personas = localStorage.getItem('esperit_custom_personas');
                return personas ? JSON.parse(personas) : [];
            }
        """)

        print(f"   LocalStorage custom personas: {len(local_storage)}")
        if len(local_storage) > 0:
            latest = local_storage[-1]
            print(f"   Latest persona:")
            print(f"      Name: {latest.get('name')}")
            print(f"      Slug: {latest.get('slug')}")
            print(f"      Category: {latest.get('category')}")
            print(f"      is_custom: {latest.get('is_custom')}")

        # Check if new persona card appears
        page.wait_for_timeout(1000)
        new_count = page.locator('.glass-panel').count()
        print(f"\n   Persona cards on page: {existing_personas} → {new_count}")

        if new_count > existing_personas:
            print("   ✅ New persona card appeared")
        else:
            print("   ⚠️  New persona card NOT visible yet")

        print("\n🔍 Step 6: Try to click the new persona\n")

        # Look for Rakhi Sawant card
        rakhi_card = page.locator('text="Rakhi Sawant"').first

        if rakhi_card.count() > 0:
            print("   ✅ Found Rakhi Sawant card")

            # Get the link URL
            parent_link = rakhi_card.locator('xpath=ancestor::a').first
            if parent_link.count() > 0:
                href = parent_link.get_attribute('href')
                print(f"   Link href: {href}")

                # Click and wait for navigation
                print("\n   Clicking persona card...")
                with page.expect_navigation(timeout=5000):
                    parent_link.click()

                page.wait_for_timeout(2000)

                current_url = page.url
                print(f"\n   Current URL: {current_url}")

                # Check if we're on chat page
                if '/chat/' in current_url:
                    print("   ✅ Navigated to chat page")

                    # Check if chat interface loaded
                    chat_input = page.locator('input[placeholder*="message"]')
                    if chat_input.count() > 0:
                        print("   ✅ Chat interface loaded")
                    else:
                        print("   ❌ Chat interface NOT found")

                else:
                    print(f"   ❌ Did NOT navigate to chat page")
                    print(f"   Expected: /chat/[slug]")
                    print(f"   Got: {current_url}")
            else:
                print("   ❌ Card is not wrapped in a link")
        else:
            print("   ❌ Rakhi Sawant card NOT found on page")

            # List all persona names visible
            all_names = page.locator('.glass-panel h3').all_inner_texts()
            print(f"\n   Visible personas: {all_names}")

        print("\n" + "=" * 70)
        print("CONSOLE MESSAGES")
        print("=" * 70)
        if console_messages:
            for msg in console_messages[-10:]:  # Last 10 messages
                print(msg)
        else:
            print("No console messages")

        print("\n" + "=" * 70)
        print("ERRORS")
        print("=" * 70)
        if errors:
            for err in errors:
                print(f"❌ {err}")
        else:
            print("✅ No JavaScript errors")

        print("\n⏸️  Browser will stay open for 5 seconds for inspection...")
        page.wait_for_timeout(5000)

        browser.close()

if __name__ == '__main__':
    test_persona_creation()
