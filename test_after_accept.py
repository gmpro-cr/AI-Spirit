#!/usr/bin/env python3
"""Test navigation after accepting cookies"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={'width': 375, 'height': 667})
    page = context.new_page()

    print("=" * 70)
    print("TESTING AFTER ACCEPTING COOKIES")
    print("=" * 70)

    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)

    # Accept cookies if banner exists
    try:
        accept_button = page.locator('button:has-text("Accept")').first
        if accept_button.count() > 0:
            print("\n✓ Accepting cookies...")
            accept_button.click()
            page.wait_for_timeout(2000)
            print("✓ Cookies accepted!")
    except:
        print("\nNo cookie banner to accept")

    # Take screenshot after accepting
    page.screenshot(path='/tmp/after_accept.png', full_page=True)
    print("✓ Screenshot: /tmp/after_accept.png")

    # Test navigation clicks
    test_cases = [
        ('Chats', '/chats'),
        ('Home', '/'),
    ]

    print("\n" + "=" * 70)
    print("TESTING NAVIGATION CLICKS")
    print("=" * 70)

    for button_text, expected_path in test_cases:
        page.goto('http://localhost:3000', wait_until='domcontentloaded')
        page.wait_for_timeout(2000)

        try:
            button = page.locator(f'nav a:has-text("{button_text}")').first
            print(f"\n--- {button_text} Button ---")
            print(f"  Visible: {button.is_visible()}")
            print(f"  Enabled: {button.is_enabled()}")

            button.click(timeout=5000)
            page.wait_for_timeout(2000)

            if expected_path in page.url:
                print(f"  ✅ SUCCESS → {page.url}")
            else:
                print(f"  ❌ FAILED → {page.url}")
        except Exception as e:
            print(f"  ❌ ERROR: {str(e)[:80]}")

    print("\n" + "=" * 70)
    print("✅ ALL TESTS COMPLETE!")
    print("=" * 70)

    print("\nBrowser will stay open for 10 seconds...")
    time.sleep(10)

    browser.close()
