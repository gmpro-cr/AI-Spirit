#!/usr/bin/env python3
"""
Comprehensive Personas Page Test
Identifies UI issues and design inconsistencies
"""

from playwright.sync_api import sync_playwright

def test_personas_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("🔍 Testing Personas Page...\n")

        # Navigate to personas page
        page.goto('http://localhost:3002/personas', wait_until='networkidle')
        page.wait_for_timeout(2000)

        # Take full page screenshot
        page.screenshot(path='/tmp/personas_page_full.png', full_page=True)
        print("📸 Full page screenshot: /tmp/personas_page_full.png\n")

        # Take viewport screenshot
        page.screenshot(path='/tmp/personas_page_viewport.png')
        print("📸 Viewport screenshot: /tmp/personas_page_viewport.png\n")

        print("=" * 70)
        print("UI ANALYSIS")
        print("=" * 70)

        # 1. Check navbar
        print("\n1️⃣ NAVBAR CHECK:")
        personas_link = page.locator('nav a:has-text("Personas")').first
        if personas_link.count() > 0:
            print("   ✅ Personas link visible (expected on non-homepage)")
        else:
            print("   ❌ Personas link missing")

        # 2. Check page heading
        print("\n2️⃣ PAGE HEADING:")
        heading = page.locator('h1, h2').first
        if heading.count() > 0:
            text = heading.inner_text()
            print(f"   Found: '{text}'")
            classes = heading.get_attribute('class')
            print(f"   Classes: {classes}")
        else:
            print("   ❌ No heading found")

        # 3. Check search functionality
        print("\n3️⃣ SEARCH BAR:")
        search_input = page.locator('input[type="text"], input[placeholder*="Search"]').first
        if search_input.count() > 0:
            placeholder = search_input.get_attribute('placeholder')
            print(f"   ✅ Search input found: '{placeholder}'")
        else:
            print("   ⚠️  No search input found")

        # 4. Check Create Persona button
        print("\n4️⃣ CREATE PERSONA BUTTON:")
        create_buttons = page.locator('button:has-text("Create"), button:has-text("New Persona")').all()
        if len(create_buttons) > 0:
            for i, btn in enumerate(create_buttons, 1):
                text = btn.inner_text()
                classes = btn.get_attribute('class')
                box = btn.bounding_box()
                print(f"   ✅ Button {i}: '{text}'")
                print(f"      Position: x={box['x']:.0f}px, y={box['y']:.0f}px")
                print(f"      Visible: {btn.is_visible()}")
        else:
            print("   ⚠️  No create button found")

        # 5. Check persona cards
        print("\n5️⃣ PERSONA CARDS:")
        persona_cards = page.locator('[class*="glass-panel"], [class*="card"]').all()
        print(f"   Found {len(persona_cards)} cards/panels")

        if len(persona_cards) > 0:
            # Check first card
            first_card = persona_cards[0]
            classes = first_card.get_attribute('class')
            print(f"   First card classes: {classes}")

            # Check for transparency
            if 'glass' in classes.lower():
                print("   ✅ Glass effect applied")

            # Check card content
            card_text = first_card.inner_text()
            print(f"   Card content preview: {card_text[:100]}...")

        # 6. Check filters/categories
        print("\n6️⃣ FILTERS/CATEGORIES:")
        filter_buttons = page.locator('button').all()
        category_filters = [btn for btn in filter_buttons if any(word in btn.inner_text().lower() for word in ['all', 'business', 'celebrity', 'historical', 'category'])]
        if len(category_filters) > 0:
            print(f"   ✅ Found {len(category_filters)} filter buttons")
            for btn in category_filters[:5]:
                print(f"      - {btn.inner_text()}")
        else:
            print("   ⚠️  No category filters found")

        # 7. Check layout/grid
        print("\n7️⃣ LAYOUT:")
        grid_container = page.locator('[class*="grid"]').first
        if grid_container.count() > 0:
            classes = grid_container.get_attribute('class')
            print(f"   ✅ Grid layout found")
            print(f"   Classes: {classes}")
        else:
            print("   ⚠️  No grid layout detected")

        # 8. Color scheme check
        print("\n8️⃣ COLOR SCHEME:")
        page_html = page.content()
        color_issues = []

        if 'cyan' in page_html.lower():
            color_issues.append('cyan')
        if 'purple' in page_html.lower() and 'gradient' in page_html.lower():
            color_issues.append('purple gradients')
        if 'from-' in page_html and 'to-' in page_html:
            color_issues.append('gradient classes')

        if len(color_issues) > 0:
            print(f"   ⚠️  Color issues found: {', '.join(color_issues)}")
        else:
            print("   ✅ Black & white theme consistent")

        # 9. Console errors
        print("\n9️⃣ CONSOLE ERRORS:")
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg) if msg.type == 'error' else None)
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(1000)

        if len(console_errors) == 0:
            print("   ✅ No console errors")
        else:
            print(f"   ⚠️  {len(console_errors)} console errors:")
            for error in console_errors[:3]:
                print(f"      - {error.text[:100]}")

        # 10. Spacing/padding issues
        print("\n🔟 SPACING ANALYSIS:")
        viewport = page.viewport_size

        if heading.count() > 0:
            heading_box = heading.bounding_box()
            heading_pct = (heading_box['y'] / viewport['height']) * 100
            print(f"   Heading position: {heading_pct:.1f}% from top")

            if heading_pct < 15:
                print("   ⚠️  Heading might be too close to navbar")
            elif heading_pct > 25:
                print("   ⚠️  Heading might be too far from navbar")
            else:
                print("   ✅ Good heading position")

        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print("Review screenshots for visual issues:")
        print("- /tmp/personas_page_full.png")
        print("- /tmp/personas_page_viewport.png")

        browser.close()

if __name__ == '__main__':
    test_personas_page()
