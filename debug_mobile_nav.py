#!/usr/bin/env python3
"""Debug mobile navigation buttons at bottom of site"""

from playwright.sync_api import sync_playwright
import time

def debug_mobile_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)

        # Create mobile viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},  # iPhone SE size
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        )

        page = context.new_page()

        # Enable console logging
        page.on('console', lambda msg: print(f'CONSOLE: {msg.type}: {msg.text}'))
        page.on('pageerror', lambda err: print(f'PAGE ERROR: {err}'))

        print("Navigating to localhost:3000...")
        page.goto('http://localhost:3000', wait_until='networkidle')

        # Take initial screenshot
        page.screenshot(path='/tmp/mobile_nav_initial.png', full_page=True)
        print("Initial screenshot saved to /tmp/mobile_nav_initial.png")

        # Wait a bit for any animations
        page.wait_for_timeout(2000)

        # Find navigation buttons at bottom
        print("\n=== Looking for navigation buttons ===")

        # Try different selectors for bottom navigation
        nav_selectors = [
            'nav[class*="bottom"]',
            '[class*="BottomNav"]',
            '[class*="bottom-nav"]',
            'nav:has(a):last-of-type',
            'footer nav',
            '[role="navigation"]:has(button)',
        ]

        nav_element = None
        for selector in nav_selectors:
            try:
                if page.locator(selector).count() > 0:
                    print(f"Found navigation using selector: {selector}")
                    nav_element = page.locator(selector).first
                    break
            except:
                continue

        if not nav_element:
            print("Trying to find all nav elements...")
            all_navs = page.locator('nav').all()
            print(f"Found {len(all_navs)} nav elements")

            # Try to find the bottom-most one
            for i, nav in enumerate(all_navs):
                box = nav.bounding_box()
                if box:
                    print(f"Nav {i}: y={box['y']}, height={box['height']}")

        # Look for all buttons and links
        print("\n=== All buttons on page ===")
        buttons = page.locator('button').all()
        print(f"Found {len(buttons)} buttons")

        for i, btn in enumerate(buttons[:10]):  # Show first 10
            try:
                text = btn.inner_text()
                classes = btn.get_attribute('class') or ''
                box = btn.bounding_box()
                y_pos = box['y'] if box else 'N/A'
                print(f"Button {i}: '{text}' | classes: {classes[:50]} | y: {y_pos}")
            except:
                pass

        print("\n=== All links on page ===")
        links = page.locator('a').all()
        print(f"Found {len(links)} links")

        # Focus on bottom links
        bottom_links = []
        for i, link in enumerate(links):
            try:
                box = link.bounding_box()
                if box and box['y'] > 500:  # Bottom half of mobile screen
                    text = link.inner_text() or link.get_attribute('aria-label') or ''
                    classes = link.get_attribute('class') or ''
                    bottom_links.append({
                        'index': i,
                        'text': text,
                        'classes': classes,
                        'y': box['y'],
                        'href': link.get_attribute('href')
                    })
            except:
                pass

        print("\n=== Bottom navigation links (y > 500) ===")
        for link_info in sorted(bottom_links, key=lambda x: x['y']):
            print(f"Link: '{link_info['text'][:30]}' | href: {link_info['href']} | y: {link_info['y']}")
            print(f"  Classes: {link_info['classes'][:80]}")

        # Try to click the first bottom navigation button
        if bottom_links:
            print("\n=== Attempting to click first bottom nav link ===")
            first_link = links[bottom_links[0]['index']]

            # Check if it's visible and enabled
            print(f"Is visible: {first_link.is_visible()}")
            print(f"Is enabled: {first_link.is_enabled()}")

            # Try to click
            try:
                print("Clicking...")
                first_link.click(timeout=5000)
                page.wait_for_timeout(2000)

                print(f"After click - Current URL: {page.url}")
                page.screenshot(path='/tmp/mobile_nav_after_click.png', full_page=True)
                print("Screenshot after click saved to /tmp/mobile_nav_after_click.png")
            except Exception as e:
                print(f"Click failed: {e}")

                # Check for any overlaying elements
                print("\n=== Checking for overlay elements ===")
                first_box = first_link.bounding_box()
                if first_box:
                    # Check what element is at this position
                    element_at_point = page.evaluate(f"""
                        document.elementFromPoint({first_box['x'] + first_box['width']/2},
                                                   {first_box['y'] + first_box['height']/2})
                    """)
                    print(f"Element at click position: {element_at_point}")

        # Keep browser open for inspection
        print("\n=== Browser will stay open for 10 seconds for inspection ===")
        time.sleep(10)

        browser.close()

if __name__ == '__main__':
    debug_mobile_navigation()
