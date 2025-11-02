#!/usr/bin/env python3
"""
Test chat functionality from user's perspective
"""

from playwright.sync_api import sync_playwright
import sys
import time

def test_chat():
    print("🧪 Testing Chat Functionality from Browser...\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Enable console logging
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        # Go to personas page
        print("1️⃣ Loading personas page...")
        page.goto('http://localhost:3002/personas', wait_until='networkidle')
        page.screenshot(path='/tmp/personas_page.png')
        print("   ✓ Personas page loaded")

        # Click on Shah Rukh Khan
        print("\n2️⃣ Clicking on Shah Rukh Khan persona...")
        srk_card = page.locator('text=Shah Rukh Khan').first
        if srk_card.count() > 0:
            srk_card.click()
            page.wait_for_load_state('networkidle')
            page.screenshot(path='/tmp/chat_page.png')
            print("   ✓ Chat page opened")
        else:
            print("   ✗ Shah Rukh Khan card not found!")
            browser.close()
            return 1

        # Check if chat interface is visible
        print("\n3️⃣ Checking chat interface...")
        chat_input = page.locator('textarea, input[type="text"]').first
        if chat_input.count() == 0:
            print("   ✗ Chat input not found!")
            browser.close()
            return 1
        print("   ✓ Chat input found")

        # Type a message
        print("\n4️⃣ Sending test message...")
        chat_input.fill("Hello!")
        page.screenshot(path='/tmp/before_send.png')

        # Find and click send button
        send_button = page.locator('button:has-text("Send"), button[type="submit"]').first
        if send_button.count() == 0:
            print("   ✗ Send button not found!")
            browser.close()
            return 1

        send_button.click()
        print("   ✓ Message sent, waiting for response...")

        # Wait for response (max 10 seconds)
        try:
            page.wait_for_selector('text=/namaste|hello|main/i', timeout=10000)
            print("   ✓ AI response received!")
            page.screenshot(path='/tmp/after_response.png')

            # Check console for errors
            errors = [msg for msg in console_messages if 'error' in msg.lower() or 'failed' in msg.lower()]
            if errors:
                print("\n⚠️ Console errors detected:")
                for err in errors:
                    print(f"   {err}")

            print("\n✅ SUCCESS: Chat is working!")
            browser.close()
            return 0

        except Exception as e:
            print(f"   ✗ No response received: {e}")
            page.screenshot(path='/tmp/no_response.png')

            # Print console messages
            print("\n📋 Console messages:")
            for msg in console_messages:
                print(f"   {msg}")

            print("\n❌ FAILED: Chat not responding")
            browser.close()
            return 1

if __name__ == "__main__":
    sys.exit(test_chat())
