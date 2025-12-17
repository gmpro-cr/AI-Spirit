#!/usr/bin/env python3
"""Simple test to verify mobile nav fix"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={'width': 375, 'height': 667})
    page = context.new_page()

    print("Loading page...")
    page.goto('http://localhost:3000', wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(5000)

    page.screenshot(path='/tmp/simple_test.png', full_page=True)
    print("Screenshot saved to /tmp/simple_test.png")

    # Try to find navigation
    try:
        nav_count = page.locator('nav').count()
        print(f"\nFound {nav_count} nav elements")

        # Find bottom nav specifically
        bottom_nav = page.locator('nav[class*="bottom"], nav.fixed.bottom-0').first
        if bottom_nav.count() > 0:
            print("✅ Bottom navigation found!")
            box = bottom_nav.bounding_box()
            print(f"   Position: y={box['y']}, height={box['height']}")

            # Check for cookie banner
            cookie = page.locator('[class*="Cookie"]').first
            if cookie.count() > 0:
                cookie_box = cookie.bounding_box()
                print(f"\n✅ Cookie banner found!")
                print(f"   Position: y={cookie_box['y']}, height={cookie_box['height']}")

                # Check overlap
                if cookie_box['y'] + cookie_box['height'] <= box['y']:
                    print(f"\n✅ NO OVERLAP! Fix is working correctly!")
                    print(f"   Gap: {box['y'] - (cookie_box['y'] + cookie_box['height']):.1f}px")
                else:
                    print(f"\n❌ OVERLAP DETECTED")
            else:
                print("\nNo cookie banner (may have been dismissed)")

            # Test click
            print("\n---Testing navigation click---")
            chats = page.locator('nav a:has-text("Chats")').first
            if chats.count() > 0:
                chats.click()
                page.wait_for_timeout(2000)
                print(f"✅ Clicked Chats, now at: {page.url}")
        else:
            print("❌ Bottom navigation not found")

    except Exception as e:
        print(f"Error: {e}")

    print("\nKeeping browser open for 10 seconds...")
    time.sleep(10)
    browser.close()
