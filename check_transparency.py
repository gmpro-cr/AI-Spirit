#!/usr/bin/env python3
"""
Check the transparency/opacity of persona tiles
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    print("🔍 Checking persona tile transparency...\n")

    # Navigate to personas page
    page.goto('http://localhost:3002/personas', wait_until='networkidle')

    # Wait a moment for everything to load
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='/tmp/transparency_check.png', full_page=True)
    print("📸 Screenshot saved: /tmp/transparency_check.png")

    # Get the first persona card
    first_card = page.locator('.glass-panel').first

    if first_card.count() > 0:
        # Get computed background color
        bg_color = first_card.evaluate('element => window.getComputedStyle(element).backgroundColor')
        print(f"\n✓ Found persona card")
        print(f"  Background color: {bg_color}")

        # Check if it's rgba
        if 'rgba' in bg_color:
            # Extract the alpha value
            import re
            match = re.search(r'rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)', bg_color)
            if match:
                alpha = float(match.group(1))
                opacity_percent = int(alpha * 100)
                print(f"  Opacity: {opacity_percent}% (alpha: {alpha})")
                print(f"  Transparency: {100 - opacity_percent}%")
        else:
            print(f"  Not using rgba (might be using rgb or named color)")
    else:
        print("✗ No persona cards found")

    browser.close()
    print("\n✅ Done")
