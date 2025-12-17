#!/usr/bin/env python3
"""Inspect the actual HTML source of the bottom navigation"""

from playwright.sync_api import sync_playwright

def inspect_nav_html():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
        )
        page = context.new_page()

        page.goto('http://localhost:3000', wait_until='networkidle')
        page.wait_for_timeout(2000)

        # Get the HTML of the bottom nav
        nav_html = page.locator('nav[class*="bottom"]').first.evaluate('el => el.outerHTML')
        print("=== BOTTOM NAV HTML ===")
        print(nav_html[:1000])

        # Get computed z-index
        nav_z_index = page.locator('nav[class*="bottom"]').first.evaluate('el => window.getComputedStyle(el).zIndex')
        print(f"\n=== NAV Z-INDEX ===")
        print(f"Z-Index: {nav_z_index}")

        # Check for cookie banner
        try:
            cookie_banner = page.locator('[class*="CookieConsent"]').first
            if cookie_banner.count() > 0:
                cookie_html = cookie_banner.evaluate('el => el.outerHTML')
                print("\n=== COOKIE BANNER HTML ===")
                print(cookie_html[:1000])

                cookie_z_index = cookie_banner.evaluate('el => window.getComputedStyle(el).zIndex')
                print(f"\n=== COOKIE BANNER Z-INDEX ===")
                print(f"Z-Index: {cookie_z_index}")
        except:
            print("\nNo cookie banner found with CookieConsent class")

            # Try finding it another way
            print("\nSearching for any element containing 'cookies' text...")
            elements_with_cookies = page.locator('text=/cookies/i').all()
            print(f"Found {len(elements_with_cookies)} elements with 'cookies' text")

            for i, el in enumerate(elements_with_cookies[:3]):
                try:
                    parent = el.evaluate('el => el.closest("div[style*=\\"z-index\\"]") || el.parentElement')
                    if parent:
                        z_index = el.evaluate('el => window.getComputedStyle(el.closest("div") || el).zIndex')
                        tag = el.evaluate('el => (el.closest("div") || el).tagName')
                        classes = el.evaluate('el => (el.closest("div") || el).className')
                        print(f"\nElement {i}: {tag}, classes: {classes[:100]}, z-index: {z_index}")
                except:
                    pass

        browser.close()

if __name__ == '__main__':
    inspect_nav_html()
