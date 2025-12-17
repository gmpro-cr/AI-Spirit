#!/usr/bin/env python3
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(4000)

    # Find all nav elements
    navs = page.locator('nav').all()
    print(f"Found {len(navs)} nav elements\n")

    for i, nav in enumerate(navs):
        try:
            box = nav.bounding_box()
            if box and box['y'] > 500:  # Bottom of screen
                classes = nav.get_attribute('class')
                z_index = nav.evaluate('el => window.getComputedStyle(el).zIndex')
                print(f"Nav {i}:")
                print(f"  Classes: {classes[:100]}")
                print(f"  Position: y={box['y']}")
                print(f"  Z-index (computed): {z_index}")
                print(f"  Z-index (inline): {nav.get_attribute('style')}")
                print()
        except:
            pass

    # Check cookie banner
    try:
        cookie = page.locator('.CookieConsent').first
        cookie_z = cookie.evaluate('el => window.getComputedStyle(el).zIndex')
        print(f"Cookie banner z-index: {cookie_z}\n")
    except:
        print("No cookie banner\n")

    browser.close()
