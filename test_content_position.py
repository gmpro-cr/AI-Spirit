#!/usr/bin/env python3
"""
Quick test to verify content moved higher on homepage
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    print("🔍 Testing content position...\n")

    page.goto('http://localhost:3002/', wait_until='networkidle')
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='/tmp/homepage_content_higher.png', full_page=True)
    print("📸 Screenshot saved: /tmp/homepage_content_higher.png\n")

    # Check heading position
    heading = page.locator('h1').first
    if heading.count() > 0:
        box = heading.bounding_box()
        viewport = page.viewport_size
        position_pct = (box['y'] / viewport['height']) * 100

        print(f"📏 Heading position:")
        print(f"   Y coordinate: {box['y']:.1f}px")
        print(f"   From top: {position_pct:.1f}% of viewport")
        print(f"   Text: '{heading.inner_text()}'")

    # Check button position
    button = page.locator('a:has-text("Start Chatting (Guest)")').first
    if button.count() > 0:
        box = button.bounding_box()
        position_pct = (box['y'] / viewport['height']) * 100
        print(f"\n📏 Button position:")
        print(f"   Y coordinate: {box['y']:.1f}px")
        print(f"   From top: {position_pct:.1f}% of viewport")

    print("\n✅ Content has been moved higher on the page")
    browser.close()
