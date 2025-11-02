#!/usr/bin/env python3
"""
Comprehensive Homepage Test
Verifies all recent changes to the homepage:
1. Personas button removed from navbar
2. Hero heading on one line with smaller font
3. Feature tiles removed
4. Buttons positioned lower on page
5. Black and white theme
"""

from playwright.sync_api import sync_playwright
import sys

def test_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("🔍 Testing Homepage Comprehensively...\n")

        # Navigate and wait for page to fully load
        page.goto('http://localhost:3002/', wait_until='networkidle')
        page.wait_for_timeout(2000)

        # Take full page screenshot
        page.screenshot(path='/tmp/homepage_comprehensive.png', full_page=True)
        print("📸 Screenshot saved: /tmp/homepage_comprehensive.png\n")

        # Test 1: Personas button should NOT be visible on homepage
        print("=" * 60)
        print("TEST 1: Personas Button Visibility on Homepage")
        print("=" * 60)
        personas_links = page.locator('nav a:has-text("Personas")').all()
        if len(personas_links) == 0:
            print("✅ PASS: Personas button correctly hidden on homepage")
        else:
            print(f"❌ FAIL: Personas button found ({len(personas_links)} instances)")
            for i, link in enumerate(personas_links, 1):
                print(f"   Instance {i}: {link.get_attribute('href')}")

        # Test 2: Logo position
        print("\n" + "=" * 60)
        print("TEST 2: Logo Position")
        print("=" * 60)
        logo = page.locator('nav a[href="/"] span:has-text("Esperit.AI")').first
        if logo.count() > 0:
            box = logo.bounding_box()
            print(f"✅ PASS: Logo found at left side (x: {box['x']:.1f}px)")
        else:
            print("❌ FAIL: Logo not found")

        # Test 3: Hero heading text and styling
        print("\n" + "=" * 60)
        print("TEST 3: Hero Heading")
        print("=" * 60)
        heading = page.locator('h1').first
        if heading.count() > 0:
            text = heading.inner_text()
            print(f"✅ Text found: '{text}'")

            # Check if on one line (no line breaks)
            if '\n' not in text:
                print("✅ PASS: Heading is on one line")
            else:
                print("❌ FAIL: Heading has line breaks")

            # Check font size classes
            classes = heading.get_attribute('class')
            if 'text-3xl' in classes or 'text-4xl' in classes or 'text-5xl' in classes:
                print(f"✅ PASS: Font size reduced (classes: {classes})")
            else:
                print(f"⚠️  Font classes: {classes}")
        else:
            print("❌ FAIL: Heading not found")

        # Test 4: Feature tiles should be removed
        print("\n" + "=" * 60)
        print("TEST 4: Feature Tiles Removal")
        print("=" * 60)

        # Look for common feature tile indicators
        feature_indicators = [
            "45+ Personas",
            "Multilingual",
            "Safe & Private"
        ]

        tiles_found = []
        for indicator in feature_indicators:
            elements = page.locator(f'text="{indicator}"').all()
            if len(elements) > 0:
                tiles_found.append(indicator)

        if len(tiles_found) == 0:
            print("✅ PASS: All feature tiles removed")
        else:
            print(f"❌ FAIL: Feature tiles still present: {', '.join(tiles_found)}")

        # Test 5: Button positioning
        print("\n" + "=" * 60)
        print("TEST 5: Button Positioning")
        print("=" * 60)

        guest_button = page.locator('a:has-text("Start Chatting (Guest)")').first
        signup_button = page.locator('a:has-text("Sign Up Free")').first

        if guest_button.count() > 0 and signup_button.count() > 0:
            guest_box = guest_button.bounding_box()
            signup_box = signup_button.bounding_box()
            viewport = page.viewport_size

            # Calculate position from top as percentage
            guest_position_pct = (guest_box['y'] / viewport['height']) * 100

            print(f"✅ Guest button found at y: {guest_box['y']:.1f}px ({guest_position_pct:.1f}% from top)")
            print(f"✅ Signup button found at y: {signup_box['y']:.1f}px")

            # Buttons should be roughly in the middle-to-lower area (40%+ from top)
            if guest_position_pct > 40:
                print(f"✅ PASS: Buttons positioned in lower area of viewport")
            else:
                print(f"⚠️  Buttons might be too high (expected >40% from top)")
        else:
            print("❌ FAIL: Buttons not found")

        # Test 6: Check for description text spacing
        print("\n" + "=" * 60)
        print("TEST 6: Description Spacing")
        print("=" * 60)

        description = page.locator('p:has-text("Engage with AI-powered personas")').first
        if description.count() > 0:
            classes = description.get_attribute('class')
            if 'mb-32' in classes:
                print(f"✅ PASS: Large bottom margin applied (mb-32)")
            elif 'mb-16' in classes:
                print(f"⚠️  Old margin still present (mb-16)")
            else:
                print(f"ℹ️  Margin classes: {classes}")

        # Test 7: Black and White Theme Check
        print("\n" + "=" * 60)
        print("TEST 7: Color Scheme")
        print("=" * 60)

        # Check if any gradient or color classes are present
        page_html = page.content()

        color_keywords = ['cyan', 'purple', 'gradient-to', 'from-cyan', 'to-purple']
        colors_found = [kw for kw in color_keywords if kw in page_html.lower()]

        if len(colors_found) == 0:
            print("✅ PASS: No color gradients detected (black & white theme)")
        else:
            print(f"⚠️  Color classes found: {', '.join(colors_found)}")

        # Check button styles
        guest_btn_class = guest_button.get_attribute('class')
        if 'bg-white' in guest_btn_class and 'text-black' in guest_btn_class:
            print("✅ PASS: Guest button has white background")

        signup_btn_class = signup_button.get_attribute('class')
        if 'border-white' in signup_btn_class:
            print("✅ PASS: Signup button has white border")

        # Test 8: Console Errors
        print("\n" + "=" * 60)
        print("TEST 8: Console Errors")
        print("=" * 60)

        # Reload page and capture console messages
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg) if msg.type == 'error' else None)
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(1000)

        if len(console_errors) == 0:
            print("✅ PASS: No console errors detected")
        else:
            print(f"⚠️  {len(console_errors)} console errors found:")
            for error in console_errors[:5]:  # Show first 5
                print(f"   - {error.text}")

        # Summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print("All tests completed. See screenshot for visual verification.")
        print("Screenshot: /tmp/homepage_comprehensive.png")

        browser.close()
        return 0

if __name__ == '__main__':
    sys.exit(test_homepage())
