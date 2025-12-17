#!/usr/bin/env python3
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(5000)

    # Get cookie banner bottom style
    try:
        bottom_style = page.locator('.CookieConsent').first.evaluate('el => el.style.bottom')
        print(f"Cookie banner bottom style: {bottom_style}")

        # Also get the inline style attribute
        inline_style = page.locator('.CookieConsent').first.get_attribute('style')
        print(f"\nFull inline style:\n{inline_style}")

        # Check if isMobile state exists in window
        is_mobile_check = page.evaluate('() => window.innerWidth < 768')
        print(f"\nWindow width < 768 (isMobile): {is_mobile_check}")
        print(f"Window width: {page.evaluate('() => window.innerWidth')}")
    except Exception as e:
        print(f"Error: {e}")

    browser.close()
