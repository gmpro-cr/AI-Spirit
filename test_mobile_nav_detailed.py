#!/usr/bin/env python3
"""Detailed test of mobile navigation with cookie banner dismissal"""

from playwright.sync_api import sync_playwright
import time

def test_mobile_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)

        # Create mobile viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        )

        page = context.new_page()

        print("Navigating to localhost:3000...")
        page.goto('http://localhost:3000', wait_until='networkidle')

        page.wait_for_timeout(2000)

        # Take screenshot with overlays
        page.screenshot(path='/tmp/nav_with_overlays.png', full_page=True)
        print("Screenshot with overlays: /tmp/nav_with_overlays.png")

        # Close the welcome popup if it exists
        print("\n=== Closing welcome popup ===")
        try:
            close_button = page.locator('button:has-text("×")').first
            if close_button.is_visible():
                close_button.click()
                print("Closed welcome popup")
                page.wait_for_timeout(500)
        except:
            print("No welcome popup found")

        # Dismiss cookie banner
        print("\n=== Dismissing cookie banner ===")
        try:
            accept_button = page.locator('button:has-text("Accept")').first
            if accept_button.is_visible():
                accept_button.click()
                print("Accepted cookies")
                page.wait_for_timeout(1000)
                page.screenshot(path='/tmp/nav_clean.png', full_page=True)
                print("Screenshot without overlays: /tmp/nav_clean.png")
        except:
            print("No cookie banner found")

        # Now test navigation
        print("\n=== Testing Bottom Navigation ===")

        # Find all bottom nav links
        nav_links = [
            {'text': 'Home', 'href': '/', 'expected_url': 'http://localhost:3000/'},
            {'text': 'Chats', 'href': '/chats', 'expected_url': 'http://localhost:3000/chats'},
            {'text': 'Sign In', 'href': '/auth/signin', 'expected_url': 'http://localhost:3000/auth/signin'},
        ]

        results = []

        for link_info in nav_links:
            print(f"\n--- Testing '{link_info['text']}' button ---")

            # Return to home page for consistency
            if page.url != 'http://localhost:3000/':
                page.goto('http://localhost:3000/', wait_until='networkidle')
                page.wait_for_timeout(1000)

            # Find the link by text
            try:
                link = page.locator(f'nav a:has-text("{link_info["text"]}"):visible').first

                # Check properties
                is_visible = link.is_visible()
                is_enabled = link.is_enabled()
                actual_href = link.get_attribute('href')

                print(f"  Visible: {is_visible}")
                print(f"  Enabled: {is_enabled}")
                print(f"  href: {actual_href}")

                # Get bounding box
                box = link.bounding_box()
                print(f"  Position: x={box['x']}, y={box['y']}, width={box['width']}, height={box['height']}")

                # Check for overlaying elements
                center_x = box['x'] + box['width'] / 2
                center_y = box['y'] + box['height'] / 2

                element_at_point = page.evaluate(f"""
                    () => {{
                        const el = document.elementFromPoint({center_x}, {center_y});
                        return {{
                            tagName: el?.tagName,
                            className: el?.className,
                            id: el?.id,
                            text: el?.textContent?.substring(0, 50)
                        }};
                    }}
                """)
                print(f"  Element at center: {element_at_point}")

                # Try clicking
                print(f"  Attempting click...")
                link.click(timeout=5000)
                page.wait_for_timeout(2000)

                new_url = page.url
                success = new_url == link_info['expected_url']

                print(f"  After click URL: {new_url}")
                print(f"  Expected URL: {link_info['expected_url']}")
                print(f"  ✅ SUCCESS" if success else f"  ❌ FAILED")

                results.append({
                    'button': link_info['text'],
                    'success': success,
                    'error': None
                })

                # Take screenshot
                page.screenshot(path=f'/tmp/nav_after_{link_info["text"].lower().replace(" ", "_")}.png')

            except Exception as e:
                print(f"  ❌ ERROR: {e}")
                results.append({
                    'button': link_info['text'],
                    'success': False,
                    'error': str(e)
                })

        # Summary
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        for result in results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            error_msg = f" ({result['error']})" if result['error'] else ""
            print(f"{result['button']}: {status}{error_msg}")

        # Test the Create button separately (might be a button, not a link)
        print("\n--- Testing 'Create' button ---")
        try:
            page.goto('http://localhost:3000/', wait_until='networkidle')
            page.wait_for_timeout(1000)

            # Look for create button/link
            create_button = page.locator('nav button:has-text("Create"), nav a:has-text("Create")').first

            if create_button.count() > 0:
                print(f"  Found Create button")
                print(f"  Visible: {create_button.is_visible()}")
                create_button.click(timeout=5000)
                page.wait_for_timeout(2000)
                print(f"  After click URL: {page.url}")
                page.screenshot(path='/tmp/nav_after_create.png')
            else:
                print("  ❌ Create button not found")
        except Exception as e:
            print(f"  ❌ ERROR: {e}")

        print("\n=== Keeping browser open for 15 seconds ===")
        time.sleep(15)

        browser.close()

if __name__ == '__main__':
    test_mobile_navigation()
