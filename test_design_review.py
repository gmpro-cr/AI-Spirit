#!/usr/bin/env python3
"""
Comprehensive design review - capture all pages
"""

from playwright.sync_api import sync_playwright
import sys

def capture_all_pages():
    print("📸 CAPTURING ALL PAGES FOR DESIGN REVIEW\n")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        try:
            # Home page
            print("\n1️⃣ CAPTURING HOME PAGE")
            page.goto('http://localhost:3002/', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/design_home.png', full_page=True)
            print("   ✓ Saved: /tmp/design_home.png")

            # Personas page
            print("\n2️⃣ CAPTURING PERSONAS PAGE")
            page.goto('http://localhost:3002/personas', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/design_personas.png', full_page=True)
            print("   ✓ Saved: /tmp/design_personas.png")

            # Chat page (with SRK)
            print("\n3️⃣ CAPTURING CHAT PAGE")
            srk = page.locator('text=Shah Rukh Khan').first
            if srk.count() > 0:
                srk.click()
                page.wait_for_load_state('networkidle')
                page.screenshot(path='/tmp/design_chat.png', full_page=True)
                print("   ✓ Saved: /tmp/design_chat.png")

            # Go back and capture auth page
            print("\n4️⃣ CAPTURING AUTH PAGE")
            page.goto('http://localhost:3002/auth/signin', wait_until='networkidle', timeout=10000)
            page.screenshot(path='/tmp/design_auth.png', full_page=True)
            print("   ✓ Saved: /tmp/design_auth.png")

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            return 1
        finally:
            browser.close()

        print("\n" + "="*60)
        print("✅ ALL PAGES CAPTURED")
        print("="*60)
        return 0

if __name__ == "__main__":
    sys.exit(capture_all_pages())
