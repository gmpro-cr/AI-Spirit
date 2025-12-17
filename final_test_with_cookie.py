#!/usr/bin/env python3
"""Final test with fresh context to see cookie banner"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    # Use a temporary context (like incognito) so cookies don't persist
    context = browser.new_context(viewport={'width': 375, 'height': 667})
    page = context.new_page()

    print("=" * 70)
    print("FINAL MOBILE NAVIGATION TEST WITH COOKIE BANNER")
    print("=" * 70)

    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(5000)

    # Take screenshot
    page.screenshot(path='/tmp/final_with_cookie.png', full_page=True)
    print("\n✓ Screenshot: /tmp/final_with_cookie.png")

    # Check for cookie banner
    try:
        cookie = page.locator('.CookieConsent').first
        if cookie.count() > 0:
            cookie_box = cookie.bounding_box()
            cookie_z = page.evaluate('() => window.getComputedStyle(document.querySelector(".CookieConsent")).zIndex')
            print(f"\n✓ Cookie banner found!")
            print(f"  Position: y={cookie_box['y']}, height={cookie_box['height']}")
            print(f"  Z-index: {cookie_z}")

            # Check nav
            nav = page.locator('nav.fixed.bottom-0').first
            nav_box = nav.bounding_box()
            nav_z = page.evaluate('() => window.getComputedStyle(document.querySelector("nav.fixed.bottom-0")).zIndex')

            print(f"\n✓ Navigation found!")
            print(f"  Position: y={nav_box['y']}, height={nav_box['height']}")
            print(f"  Z-index: {nav_z}")

            # Check z-index ordering
            if int(nav_z) > int(cookie_z):
                print(f"\n✅ SUCCESS! Navigation (z={nav_z}) is above cookie banner (z={cookie_z})")
                print("   Navigation buttons should be clickable!")
            else:
                print(f"\n❌ ISSUE: Cookie banner (z={cookie_z}) is above or equal to navigation (z={nav_z})")

            # Test click
            print("\n--- Testing Click ---")
            try:
                chats = page.locator('nav a:has-text("Chats")').first
                chats.click(timeout=5000)
                page.wait_for_timeout(2000)
                print(f"✅ Successfully clicked Chats → {page.url}")
            except Exception as e:
                print(f"❌ Click failed: {str(e)[:100]}")
        else:
            print("\nNo cookie banner found")
    except Exception as e:
        print(f"\nError: {e}")

    print("\n" + "=" * 70)
    print("Test Complete! Browser will stay open for inspection...")
    print("=" * 70)
    time.sleep(15)

    browser.close()
