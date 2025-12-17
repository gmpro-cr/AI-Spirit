#!/usr/bin/env python3
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 375, 'height': 667})
    page.goto('http://localhost:3000', wait_until='domcontentloaded')
    page.wait_for_timeout(4000)

    # Get cookie banner HTML
    try:
        cookie_html = page.locator('[class*="Cookie"]').first.evaluate('el => el.outerHTML')
        print("=== COOKIE BANNER HTML ===")
        print(cookie_html[:2000])
    except:
        print("No cookie banner found")

    # Also check page source for cookie consent script/component
    page_html = page.content()
    if 'CookieConsent' in page_html:
        print("\n'CookieConsent' found in page HTML")
        # Find where it appears
        idx = page_html.find('CookieConsent')
        print(f"Context: {page_html[max(0,idx-200):idx+200]}")

    browser.close()
