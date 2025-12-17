#!/usr/bin/env python3
"""Final verification of mobile navigation fix"""

from playwright.sync_api import sync_playwright
import time

def final_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
        )
        page = context.new_page()

        print("=" * 70)
        print("FINAL MOBILE NAVIGATION VERIFICATION")
        print("=" * 70)

        page.goto('http://localhost:3000', wait_until='domcontentloaded')
        page.wait_for_timeout(4000)

        # Take initial screenshot
        page.screenshot(path='/tmp/final_initial.png', full_page=True)
        print("\n✓ Screenshot: /tmp/final_initial.png")

        # Check navigation
        try:
            nav = page.locator('nav.fixed.bottom-0').first
            nav_box = nav.bounding_box()
            print(f"\n✓ Navigation found at y={nav_box['y']}, height={nav_box['height']}")
        except:
            print("\n❌ Navigation not found")
            browser.close()
            return

        # Check cookie banner position
        try:
            cookie_banner = page.locator('.CookieConsent').first
            if cookie_banner.count() > 0:
                cookie_box = cookie_banner.bounding_box()
                print(f"✓ Cookie banner found at y={cookie_box['y']}, height={cookie_box['height']}")

                # Check overlap
                nav_top = nav_box['y']
                cookie_bottom = cookie_box['y'] + cookie_box['height']

                if cookie_bottom <= nav_top:
                    gap = nav_top - cookie_bottom
                    print(f"\n{'='*70}")
                    print(f"✅ SUCCESS! No overlap detected")
                    print(f"   Gap between cookie banner and navigation: {gap:.1f}px")
                    print(f"{'='*70}")
                else:
                    overlap = cookie_bottom - nav_top
                    print(f"\n{'='*70}")
                    print(f"❌ OVERLAP DETECTED: {overlap:.1f}px")
                    print(f"{'='*70}")
            else:
                print("\n✓ No cookie banner present (may have been dismissed)")
        except Exception as e:
            print(f"\nℹ️  No cookie banner: {e}")

        # Test clicking navigation
        print("\n" + "=" * 70)
        print("Testing Navigation Clicks")
        print("=" * 70)

        test_cases = [
            ('Chats', '/chats'),
            ('Home', '/'),
        ]

        for button_text, expected_path in test_cases:
            page.goto('http://localhost:3000', wait_until='domcontentloaded')
            page.wait_for_timeout(2000)

            try:
                button = page.locator(f'nav a:has-text("{button_text}")').first
                button.click(timeout=5000)
                page.wait_for_timeout(2000)

                if expected_path in page.url:
                    print(f"✅ {button_text}: Clicked successfully → {page.url}")
                else:
                    print(f"❌ {button_text}: Failed (current URL: {page.url})")
            except Exception as e:
                print(f"❌ {button_text}: Error - {e}")

        print("\n" + "=" * 70)
        print("All Tests Complete!")
        print("=" * 70)

        print("\nBrowser will remain open for 10 seconds...")
        time.sleep(10)

        browser.close()

if __name__ == '__main__':
    final_verification()
