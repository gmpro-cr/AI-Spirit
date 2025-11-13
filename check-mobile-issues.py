from playwright.sync_api import sync_playwright
import time

def check_mobile_issues():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")

        issues = []

        print("📱 Checking Mobile UI Issues...")
        print("=" * 60)

        # Test 1: iPhone 12 Pro (390x844)
        print("\n📱 Testing on iPhone 12 Pro (390x844)...")
        context1 = browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page1 = context1.new_page()
        page1.goto('http://localhost:3001/', wait_until='networkidle', timeout=10000)
        time.sleep(2)

        # Check 1: Horizontal scroll
        has_h_scroll = page1.evaluate('() => document.documentElement.scrollWidth > document.documentElement.clientWidth')
        if has_h_scroll:
            scroll_width = page1.evaluate('() => document.documentElement.scrollWidth')
            client_width = page1.evaluate('() => document.documentElement.clientWidth')
            issues.append(f"❌ Horizontal scroll detected: {scroll_width}px content in {client_width}px viewport")
            print(f"❌ Horizontal scroll: {scroll_width}px > {client_width}px")
        else:
            print("✅ No horizontal scroll")

        # Check 2: Side panel visibility
        side_panel_hidden = page1.evaluate('''() => {
            const aside = document.querySelector('aside');
            if (!aside) return true;
            const style = window.getComputedStyle(aside);
            return style.display === 'none' || !aside.offsetParent;
        }''')

        if not side_panel_hidden:
            issues.append("❌ Side panel visible on mobile (should be hidden)")
            print("❌ Side panel visible on mobile")
        else:
            print("✅ Side panel hidden on mobile")

        # Check 3: Touch target sizes
        small_buttons = page1.evaluate('''() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            return buttons.slice(0, 10).map((btn, i) => {
                const rect = btn.getBoundingClientRect();
                return {
                    index: i,
                    width: rect.width,
                    height: rect.height,
                    text: btn.textContent.trim().substring(0, 30)
                };
            }).filter(b => b.width > 0 && b.height > 0 && (b.width < 44 || b.height < 44));
        }''')

        if small_buttons:
            issues.append(f"❌ {len(small_buttons)} touch targets smaller than 44x44px")
            print(f"❌ {len(small_buttons)} small touch targets:")
            for btn in small_buttons[:3]:
                print(f"   - {btn['width']:.0f}x{btn['height']:.0f}px: '{btn['text']}'")
        else:
            print("✅ All touch targets are adequate size")

        # Check 4: Text readability
        small_text = page1.evaluate('''() => {
            const elements = Array.from(document.querySelectorAll('p, span, div, a, button'));
            return elements.slice(0, 20).map(el => {
                const style = window.getComputedStyle(el);
                const fontSize = parseFloat(style.fontSize);
                return {
                    fontSize: fontSize,
                    text: el.textContent.trim().substring(0, 30)
                };
            }).filter(e => e.text && e.fontSize < 14);
        }''')

        if small_text:
            issues.append(f"❌ {len(small_text)} text elements smaller than 14px")
            print(f"❌ {len(small_text)} small text elements (< 14px):")
            for txt in small_text[:3]:
                print(f"   - {txt['fontSize']:.0f}px: '{txt['text']}'")
        else:
            print("✅ Text is readable size")

        # Check 5: Viewport meta tag
        has_viewport = page1.evaluate('''() => {
            const meta = document.querySelector('meta[name="viewport"]');
            return meta ? meta.getAttribute('content') : null;
        }''')

        if not has_viewport:
            issues.append("❌ Missing viewport meta tag")
            print("❌ Missing viewport meta tag")
        elif 'width=device-width' not in has_viewport:
            issues.append(f"⚠️  Viewport meta tag doesn't have width=device-width: {has_viewport}")
            print(f"⚠️  Viewport meta: {has_viewport}")
        else:
            print(f"✅ Viewport meta tag correct: {has_viewport}")

        page1.screenshot(path='/tmp/mobile-home-check.png', full_page=True)
        context1.close()

        # Test 2: iPhone SE (375x667) - Smaller screen
        print("\n📱 Testing on iPhone SE (375x667)...")
        context2 = browser.new_context(
            viewport={'width': 375, 'height': 667},
            device_scale_factor=2,
            is_mobile=True
        )
        page2 = context2.new_page()
        page2.goto('http://localhost:3001/', wait_until='networkidle', timeout=10000)
        time.sleep(2)

        has_h_scroll_se = page2.evaluate('() => document.documentElement.scrollWidth > document.documentElement.clientWidth')
        if has_h_scroll_se:
            scroll_width = page2.evaluate('() => document.documentElement.scrollWidth')
            client_width = page2.evaluate('() => document.documentElement.clientWidth')
            issues.append(f"❌ iPhone SE: Horizontal scroll {scroll_width}px > {client_width}px")
            print(f"❌ Horizontal scroll on smaller screen")
        else:
            print("✅ No horizontal scroll on smaller screen")

        page2.screenshot(path='/tmp/mobile-se-check.png', full_page=True)
        context2.close()

        # Test 3: Tablet/iPad (768x1024)
        print("\n📱 Testing on iPad (768x1024)...")
        context3 = browser.new_context(
            viewport={'width': 768, 'height': 1024},
            device_scale_factor=2,
            is_mobile=True
        )
        page3 = context3.new_page()
        page3.goto('http://localhost:3001/', wait_until='networkidle', timeout=10000)
        time.sleep(2)

        # On tablet, side panel should show
        side_panel_visible_tablet = page3.evaluate('''() => {
            const aside = document.querySelector('aside');
            if (!aside) return false;
            const style = window.getComputedStyle(aside);
            return style.display !== 'none' && aside.offsetParent;
        }''')

        if side_panel_visible_tablet:
            print("✅ Side panel visible on tablet (correct)")
        else:
            issues.append("⚠️  Side panel hidden on tablet (should show on md+ screens)")
            print("⚠️  Side panel hidden on tablet")

        page3.screenshot(path='/tmp/mobile-tablet-check.png', full_page=True)
        context3.close()

        browser.close()

        # Summary
        print("\n" + "=" * 60)
        print("📋 SUMMARY OF MOBILE UI ISSUES")
        print("=" * 60)

        if not issues:
            print("✅ No major issues found! Mobile UI looks good.")
        else:
            print(f"Found {len(issues)} issues:\n")
            for i, issue in enumerate(issues, 1):
                print(f"{i}. {issue}")

        print("\n📸 Screenshots saved:")
        print("   - /tmp/mobile-home-check.png (iPhone 12 Pro)")
        print("   - /tmp/mobile-se-check.png (iPhone SE)")
        print("   - /tmp/mobile-tablet-check.png (iPad)")

if __name__ == "__main__":
    check_mobile_issues()
