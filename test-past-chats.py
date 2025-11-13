from playwright.sync_api import sync_playwright
import time

def test_past_chats():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Collect console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append({
            "type": msg.type,
            "text": msg.text
        }))

        # Collect errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            print("🌐 Navigating to http://localhost:3001")
            page.goto('http://localhost:3001', wait_until='networkidle')
            time.sleep(2)

            print("\n📸 Taking screenshot of home page...")
            page.screenshot(path='/tmp/home-page.png')

            # Check if we're on the home page or already signed in
            print("\n🔍 Checking page state...")

            # Try to navigate to personas page
            print("\n👥 Navigating to personas page...")
            page.goto('http://localhost:3001/personas', wait_until='networkidle')
            time.sleep(3)

            print("\n📸 Taking screenshot of personas page...")
            page.screenshot(path='/tmp/personas-page.png')

            # Wait a bit for side panel to load
            time.sleep(2)

            print("\n📋 Console messages:")
            for msg in console_messages:
                print(f"  [{msg['type']}] {msg['text']}")

            if errors:
                print("\n❌ Errors:")
                for err in errors:
                    print(f"  {err}")

            # Check if past chats section is visible
            past_chats_section = page.query_selector('text=Past Chats')
            if past_chats_section:
                print("\n✅ Past Chats section found")

                # Check for loading state
                loading = page.query_selector('text=Loading...')
                if loading:
                    print("  ⏳ Loading state detected")

                # Check for "No past chats yet"
                no_chats = page.query_selector('text=No past chats yet')
                if no_chats:
                    print("  📭 'No past chats yet' message displayed")

                # Check for actual chat items
                chat_items = page.query_selector_all('button')
                chat_buttons = [btn for btn in chat_items if 'Chat with' in (page.evaluate('(el) => el.textContent', btn) or '')]
                if chat_buttons:
                    print(f"  ✅ Found {len(chat_buttons)} past chat buttons")
                else:
                    print("  ❌ No past chat buttons found")
            else:
                print("\n❌ Past Chats section not found")

            print("\n✅ Test complete! Screenshots saved to /tmp/")

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            print("\n📋 Console messages before error:")
            for msg in console_messages:
                print(f"  [{msg['type']}] {msg['text']}")

        finally:
            browser.close()

if __name__ == "__main__":
    test_past_chats()
