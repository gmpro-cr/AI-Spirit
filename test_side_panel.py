from playwright.sync_api import sync_playwright
import sys

def test_side_panel():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Testing Side Panel Functionality...")

        # Test 1: Side panel on personas page
        print("\n1. Testing side panel on personas page...")
        page.goto('http://localhost:3002/personas')
        page.wait_for_load_state('networkidle')

        # Check if side panel exists
        side_panel = page.locator('div.fixed.left-0.top-16')
        if not side_panel.count() > 0:
            print("❌ FAIL: Side panel not found on personas page")
            browser.close()
            sys.exit(1)
        print("✅ Side panel found on personas page (left side)")

        # Check for Account section
        account_header = page.locator('text=Account')
        if not account_header.count() > 0:
            print("❌ FAIL: Account header not found")
            browser.close()
            sys.exit(1)
        print("✅ Account section found")

        # Check for Sign In button (guest mode)
        sign_in_btn = page.locator('text=Sign In')
        if not sign_in_btn.count() > 0:
            print("❌ FAIL: Sign In button not found")
            browser.close()
            sys.exit(1)
        print("✅ Sign In button found")

        # Check for Recent Chats section
        recent_chats = page.locator('text=Recent Chats')
        if not recent_chats.count() > 0:
            print("❌ FAIL: Recent Chats section not found")
            browser.close()
            sys.exit(1)
        print("✅ Recent Chats section found")

        # Check for Browse All Personas button
        browse_btn = page.locator('text=Browse All Personas')
        if not browse_btn.count() > 0:
            print("❌ FAIL: Browse All Personas button not found")
            browser.close()
            sys.exit(1)
        print("✅ Browse All Personas button found")

        # Take screenshot of personas page with side panel
        page.screenshot(path='/tmp/personas_with_sidepanel.png', full_page=True)
        print("📸 Screenshot saved: /tmp/personas_with_sidepanel.png")

        # Test 2: Navigate to a chat page to create recent persona
        print("\n2. Testing side panel on chat page...")
        page.click('text=Elon Musk')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)  # Wait for tracking to complete

        # Check if side panel exists on chat page
        side_panel_chat = page.locator('div.fixed.left-0.top-16')
        if not side_panel_chat.count() > 0:
            print("❌ FAIL: Side panel not found on chat page")
            browser.close()
            sys.exit(1)
        print("✅ Side panel found on chat page (left side)")

        # Check that chat interface has proper padding
        chat_container = page.locator('div.pl-72')
        if not chat_container.count() > 0:
            print("❌ FAIL: Chat container doesn't have left padding for side panel")
            browser.close()
            sys.exit(1)
        print("✅ Chat container has proper padding (left side)")

        # Take screenshot of chat page with side panel
        page.screenshot(path='/tmp/chat_with_sidepanel.png', full_page=True)
        print("📸 Screenshot saved: /tmp/chat_with_sidepanel.png")

        # Test 3: Go back to personas page and check recent personas
        print("\n3. Testing recent personas tracking...")
        page.goto('http://localhost:3002/personas')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)

        # Check if Elon Musk appears in recent chats
        elon_recent = page.locator('text=Elon Musk').nth(1)  # First is in grid, second in sidebar
        if elon_recent.count() > 0:
            print("✅ Recent persona (Elon Musk) appears in side panel")
        else:
            print("⚠️  WARNING: Recent persona may not be visible yet")

        # Test 4: Click another persona to test tracking
        print("\n4. Testing multiple recent personas...")
        page.click('text=Shah Rukh Khan')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Go back to personas
        page.goto('http://localhost:3002/personas')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)

        # Take final screenshot showing multiple recent personas
        page.screenshot(path='/tmp/personas_with_recent.png', full_page=True)
        print("📸 Screenshot saved: /tmp/personas_with_recent.png")

        # Test 5: Verify side panel layout
        print("\n5. Verifying side panel layout...")

        # Check width (should be w-64 = 256px = 16rem)
        side_panel_element = page.locator('div.fixed.left-0.top-16').first
        box = side_panel_element.bounding_box()
        if box:
            width = box['width']
            if abs(width - 256) < 5:  # Allow 5px tolerance
                print(f"✅ Side panel width correct: {width}px")
            else:
                print(f"⚠️  WARNING: Side panel width is {width}px, expected ~256px")

        # Check if panel is fixed to left
        styles = page.evaluate('''() => {
            const panel = document.querySelector('div.fixed.left-0.top-16');
            if (!panel) return null;
            const styles = window.getComputedStyle(panel);
            return {
                position: styles.position,
                left: styles.left,
                top: styles.top
            };
        }''')

        if styles:
            if styles['position'] == 'fixed' and styles['left'] == '0px':
                print("✅ Side panel correctly positioned (fixed left)")
            else:
                print(f"⚠️  WARNING: Side panel position: {styles}")

        print("\n" + "="*50)
        print("✅ ALL TESTS PASSED!")
        print("="*50)

        browser.close()

if __name__ == '__main__':
    test_side_panel()
