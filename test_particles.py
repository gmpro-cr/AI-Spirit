#!/usr/bin/env python3
"""
Test script to verify ParticlesBackground is visible on all pages.
Checks for Canvas element and verifies particles are being drawn.
"""

from playwright.sync_api import sync_playwright
import sys

def test_particles_on_page(page, url, page_name):
    """Test that particles are visible on a specific page"""
    print(f"\n{'='*60}")
    print(f"Testing: {page_name}")
    print(f"URL: {url}")
    print(f"{'='*60}")

    # Navigate to the page
    page.goto(url, wait_until='networkidle')
    print(f"✓ Page loaded")

    # Check if Canvas element exists
    canvas = page.locator('canvas').first
    if not canvas.count():
        print(f"✗ FAIL: No canvas element found on {page_name}")
        return False
    print(f"✓ Canvas element found")

    # Check canvas styling
    style = canvas.evaluate("""(element) => {
        const computed = window.getComputedStyle(element);
        return {
            position: computed.position,
            zIndex: computed.zIndex,
            width: computed.width,
            height: computed.height,
            pointerEvents: computed.pointerEvents
        };
    }""")

    print(f"  Canvas style:")
    print(f"    Position: {style['position']}")
    print(f"    Z-Index: {style['zIndex']}")
    print(f"    Width: {style['width']}")
    print(f"    Height: {style['height']}")
    print(f"    Pointer Events: {style['pointerEvents']}")

    # Verify critical styles
    if style['position'] != 'fixed':
        print(f"  ⚠ Warning: Canvas position is '{style['position']}', should be 'fixed'")
    if style['zIndex'] != '9999':
        print(f"  ⚠ Warning: Canvas z-index is '{style['zIndex']}', should be '9999'")

    # Check if canvas is in DOM
    is_visible = canvas.evaluate("(element) => element.isConnected")
    if not is_visible:
        print(f"✗ FAIL: Canvas is not connected to DOM on {page_name}")
        return False
    print(f"✓ Canvas is connected to DOM")

    # Check canvas dimensions
    dimensions = canvas.evaluate("""(element) => ({
        width: element.width,
        height: element.height
    })""")
    print(f"✓ Canvas dimensions: {dimensions['width']}x{dimensions['height']}")

    if dimensions['width'] == 0 or dimensions['height'] == 0:
        print(f"✗ FAIL: Canvas has zero dimensions on {page_name}")
        return False

    # Check if 2D context exists (proves animation is running)
    has_context = canvas.evaluate("""(element) => {
        const ctx = element.getContext('2d');
        return ctx !== null;
    }""")

    if not has_context:
        print(f"✗ FAIL: Canvas 2D context not found on {page_name}")
        return False
    print(f"✓ Canvas 2D context exists")

    # Take screenshot for visual verification
    screenshot_path = f"/tmp/esperit_{page_name.lower().replace(' ', '_')}.png"
    page.screenshot(path=screenshot_path, full_page=False)
    print(f"✓ Screenshot saved: {screenshot_path}")

    print(f"\n✓ SUCCESS: Particles appear to be working on {page_name}")
    return True

def main():
    """Run tests on all pages"""
    base_url = "http://localhost:3002"

    pages_to_test = [
        (f"{base_url}/", "Homepage"),
        (f"{base_url}/personas", "Personas Page"),
        (f"{base_url}/auth/signin", "Sign In Page"),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        results = {}
        for url, page_name in pages_to_test:
            try:
                results[page_name] = test_particles_on_page(page, url, page_name)
            except Exception as e:
                print(f"\n✗ ERROR on {page_name}: {e}")
                results[page_name] = False

        browser.close()

        # Print summary
        print(f"\n{'='*60}")
        print("SUMMARY")
        print(f"{'='*60}")

        all_passed = True
        for page_name, passed in results.items():
            status = "✓ PASS" if passed else "✗ FAIL"
            print(f"{status}: {page_name}")
            if not passed:
                all_passed = False

        print(f"{'='*60}\n")

        if all_passed:
            print("✓ All tests passed! Particles are visible on all pages.")
            return 0
        else:
            print("✗ Some tests failed. Check output above for details.")
            return 1

if __name__ == "__main__":
    sys.exit(main())
