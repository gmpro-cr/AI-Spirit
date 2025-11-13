from playwright.sync_api import sync_playwright
import time

def test_mobile_ui():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(
            headless=False,
            channel="chrome"
        )

        # Create mobile context (iPhone 12 Pro)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        )

        page = context.new_page()

        print("📱 Testing Mobile UI...")
        print("=" * 60)

        # Test home page
        print("\n1️⃣ Testing Home Page (/)...")
        page.goto('http://localhost:3001/', wait_until='networkidle')
        time.sleep(2)
        page.screenshot(path='/tmp/mobile-home.png', full_page=True)
        print("✅ Screenshot saved: /tmp/mobile-home.png")

        # Check if side panel is visible (should be hidden on mobile)
        side_panel = page.query_selector('aside')
        if side_panel:
            is_visible = page.evaluate('(el) => window.getComputedStyle(el).display !== "none"', side_panel)
            if is_visible:
                print("❌ ISSUE: Side panel is visible on mobile (should be hidden)")
            else:
                print("✅ Side panel correctly hidden on mobile")

        # Check mobile menu button
        mobile_menu = page.query_selector('button svg.h-6')
        if mobile_menu:
            print("✅ Mobile menu button found")
        else:
            print("❌ ISSUE: No mobile menu button found")

        # Test personas page
        print("\n2️⃣ Testing Personas Page (/personas)...")
        page.goto('http://localhost:3001/auth/signin', wait_until='networkidle')
        time.sleep(2)
        page.screenshot(path='/tmp/mobile-signin.png', full_page=True)
        print("✅ Screenshot saved: /tmp/mobile-signin.png")

        # Check if sign in page is responsive
        print("\n3️⃣ Checking responsive layout...")

        # Get viewport dimensions
        viewport = page.viewport_size
        print(f"   Viewport: {viewport['width']}x{viewport['height']}")

        # Check for horizontal scroll
        has_horizontal_scroll = page.evaluate('''
            () => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth
            }
        ''')

        if has_horizontal_scroll:
            print("❌ ISSUE: Page has horizontal scroll (layout overflow)")
        else:
            print("✅ No horizontal scroll (good)")

        # Check font sizes
        body_font = page.evaluate('() => window.getComputedStyle(document.body).fontSize')
        print(f"   Body font size: {body_font}")

        # Check touch targets (buttons should be at least 44x44px for mobile)
        buttons = page.query_selector_all('button')
        print(f"\n   Found {len(buttons)} buttons")

        small_buttons = []
        for i, btn in enumerate(buttons[:5]):  # Check first 5 buttons
            try:
                box = btn.bounding_box()
                if box and (box['width'] < 44 or box['height'] < 44):
                    small_buttons.append((i, box))
            except:
                pass

        if small_buttons:
            print(f"❌ ISSUE: {len(small_buttons)} buttons smaller than 44x44px (too small for touch)")
            for idx, box in small_buttons[:3]:
                print(f"   Button {idx}: {box['width']:.0f}x{box['height']:.0f}px")
        else:
            print("✅ All checked buttons have good touch target size")

        print("\n4️⃣ Testing different mobile sizes...")

        # Test on smaller phone (iPhone SE)
        context2 = browser.new_context(
            viewport={'width': 375, 'height': 667},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page2 = context2.new_page()
        page2.goto('http://localhost:3001/', wait_until='networkidle')
        time.sleep(2)
        page2.screenshot(path='/tmp/mobile-iphone-se.png', full_page=True)
        print("✅ Screenshot saved: /tmp/mobile-iphone-se.png")

        # Test on tablet (iPad)
        context3 = browser.new_context(
            viewport={'width': 768, 'height': 1024},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page3 = context3.new_page()
        page3.goto('http://localhost:3001/', wait_until='networkidle')
        time.sleep(2)
        page3.screenshot(path='/tmp/mobile-ipad.png', full_page=True)
        print("✅ Screenshot saved: /tmp/mobile-ipad.png")

        print("\n" + "=" * 60)
        print("📸 All screenshots saved to /tmp/")
        print("   - mobile-home.png (iPhone 12 Pro)")
        print("   - mobile-signin.png (Sign-in page)")
        print("   - mobile-iphone-se.png (Smaller phone)")
        print("   - mobile-ipad.png (Tablet)")
        print("\n⏸️  Keeping browser open for 15 seconds for manual inspection...")

        time.sleep(15)

        browser.close()

if __name__ == "__main__":
    test_mobile_ui()
