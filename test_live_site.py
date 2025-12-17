#!/usr/bin/env python3
"""Test mobile navigation on live site ai-spirit.in"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={'width': 375, 'height': 667})
    page = context.new_page()

    print("=" * 70)
    print("TESTING LIVE SITE: ai-spirit.in")
    print("=" * 70)

    try:
        page.goto('https://ai-spirit.in', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(5000)

        # Take screenshot
        page.screenshot(path='/tmp/live_site.png', full_page=True)
        print("\n✓ Screenshot: /tmp/live_site.png")

        # Check for cookie banner
        try:
            cookie = page.locator('.CookieConsent').first
            if cookie.count() > 0:
                cookie_box = cookie.bounding_box()
                cookie_z = page.evaluate('() => window.getComputedStyle(document.querySelector(".CookieConsent")).zIndex')
                print(f"\n✓ Cookie banner found!")
                print(f"  Position: y={cookie_box['y']}, height={cookie_box['height']}")
                print(f"  Z-index: {cookie_z}")
            else:
                print("\n✓ No cookie banner (may have been accepted)")
        except:
            print("\n✓ No cookie banner found")

        # Check for mobile navigation
        try:
            nav = page.locator('nav.fixed.bottom-0, nav[class*="bottom"]').first
            if nav.count() > 0:
                nav_box = nav.bounding_box()
                nav_z = page.evaluate('() => window.getComputedStyle(document.querySelector("nav.fixed.bottom-0") || document.querySelector("nav")).zIndex')

                print(f"\n✓ Mobile navigation found!")
                print(f"  Position: y={nav_box['y']}, height={nav_box['height']}")
                print(f"  Z-index: {nav_z}")

                # Check z-index comparison if both exist
                try:
                    cookie_exists = page.locator('.CookieConsent').count() > 0
                    if cookie_exists:
                        cookie_z_val = page.evaluate('() => window.getComputedStyle(document.querySelector(".CookieConsent")).zIndex')
                        nav_z_val = nav_z

                        print(f"\n--- Z-Index Comparison ---")
                        print(f"Navigation: {nav_z_val}")
                        print(f"Cookie Banner: {cookie_z_val}")

                        try:
                            if int(nav_z_val) > int(cookie_z_val):
                                print("✅ Navigation is ABOVE cookie banner (correct!)")
                            else:
                                print("❌ Cookie banner is ABOVE or EQUAL to navigation (issue!)")
                        except:
                            print(f"⚠️  Cannot compare: nav={nav_z_val}, cookie={cookie_z_val}")
                except:
                    pass

            else:
                print("\n❌ Mobile navigation not found!")
        except Exception as e:
            print(f"\n❌ Error checking navigation: {e}")

        # Test clicking navigation if it exists
        print("\n--- Testing Navigation Clicks ---")

        test_buttons = ['Home', 'Chats', 'Sign In']

        for button_text in test_buttons:
            try:
                # Go back to home for each test
                page.goto('https://ai-spirit.in', wait_until='domcontentloaded', timeout=15000)
                page.wait_for_timeout(2000)

                button = page.locator(f'nav a:has-text("{button_text}"), nav button:has-text("{button_text}")').first

                if button.count() > 0:
                    print(f"\n{button_text}:")
                    print(f"  Visible: {button.is_visible()}")
                    print(f"  Enabled: {button.is_enabled()}")

                    try:
                        button.click(timeout=5000)
                        page.wait_for_timeout(2000)
                        print(f"  ✅ Clicked successfully → {page.url}")
                    except Exception as e:
                        print(f"  ❌ Click failed: {str(e)[:80]}")
                else:
                    print(f"\n{button_text}: Not found")

            except Exception as e:
                print(f"\n{button_text}: Error - {str(e)[:80]}")

        print("\n" + "=" * 70)
        print("LIVE SITE TEST COMPLETE")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error loading site: {e}")
        page.screenshot(path='/tmp/live_site_error.png')
        print("Error screenshot: /tmp/live_site_error.png")

    print("\nBrowser will stay open for 15 seconds...")
    time.sleep(15)

    browser.close()
