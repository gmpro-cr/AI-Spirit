from playwright.sync_api import sync_playwright
import time

def test_personas_mobile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")

        print("📱 Checking Personas Page Mobile UI...")
        print("=" * 60)

        # Test on tablet (iPad)
        print("\n📱 Testing /personas on iPad (768x1024)...")
        context = browser.new_context(
            viewport={'width': 768, 'height': 1024},
            device_scale_factor=2,
            is_mobile=True
        )
        page = context.new_page()

        # Go directly to personas page (will redirect to signin)
        page.goto('http://localhost:3001/personas', wait_until='networkidle', timeout=10000)
        time.sleep(2)

        # Check current URL
        current_url = page.url
        print(f"Current URL: {current_url}")

        if '/auth/signin' in current_url:
            print("⚠️  Redirected to sign-in (expected for unauthenticated user)")
            print("   Cannot test sidebar on personas page without authentication")
        else:
            # Check if side panel exists and is visible
            side_panel_visible = page.evaluate('''() => {
                const aside = document.querySelector('aside');
                if (!aside) return false;
                const style = window.getComputedStyle(aside);
                return style.display !== 'none' && aside.offsetParent;
            }''')

            if side_panel_visible:
                print("✅ Side panel visible on tablet personas page")
            else:
                print("❌ Side panel hidden on tablet personas page")

        page.screenshot(path='/tmp/personas-tablet.png', full_page=True)
        print("📸 Screenshot: /tmp/personas-tablet.png")

        # Test on mobile (iPhone 12 Pro)
        print("\n📱 Testing /personas on iPhone 12 Pro (390x844)...")
        context2 = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True
        )
        page2 = context2.new_page()
        page2.goto('http://localhost:3001/personas', wait_until='networkidle', timeout=10000)
        time.sleep(2)

        if '/auth/signin' in page2.url:
            # Check if mobile back button exists on signin page
            mobile_back = page2.query_selector('button svg.h-6')
            if mobile_back:
                print("✅ Mobile navigation elements found")
            else:
                print("⚠️  No mobile navigation button")

        page2.screenshot(path='/tmp/personas-mobile.png', full_page=True)
        print("📸 Screenshot: /tmp/personas-mobile.png")

        browser.close()

        print("\n" + "=" * 60)
        print("Note: The home page (/) doesn't have a sidebar")
        print("Sidebar only appears on /personas and /chat pages")
        print("This is normal behavior")

if __name__ == "__main__":
    test_personas_mobile()
