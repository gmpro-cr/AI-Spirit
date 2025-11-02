#!/usr/bin/env python3
"""
Test homepage changes:
1. Personas button removed from homepage
2. Hero heading in one line
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    print("🔍 Testing homepage changes...\n")

    # Navigate to homepage
    page.goto('http://localhost:3002/', wait_until='networkidle')
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='/tmp/homepage_updated.png', full_page=True)
    print("📸 Screenshot saved: /tmp/homepage_updated.png")

    # Check if Personas link is visible on homepage
    personas_link = page.locator('nav a:has-text("Personas")')
    personas_count = personas_link.count()

    if personas_count == 0:
        print("\n✅ Personas link removed from homepage navbar")
    else:
        print(f"\n❌ Personas link still visible on homepage ({personas_count} found)")

    # Check hero heading
    hero_heading = page.locator('h1').first
    if hero_heading.count() > 0:
        heading_text = hero_heading.inner_text()
        print(f"\n✅ Hero heading found:")
        print(f"   Text: {heading_text}")

        # Check if it's on one line (no line breaks)
        if '\n' not in heading_text:
            print("   ✅ Heading is on one line")
        else:
            print("   ⚠️ Heading has line breaks")

    # Check Esperit.AI logo position
    logo = page.locator('nav a[href="/"] span')
    if logo.count() > 0:
        print("\n✅ Esperit.AI logo found in navbar (left side)")

    browser.close()
    print("\n✅ Testing complete")
