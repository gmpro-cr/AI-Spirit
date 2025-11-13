from playwright.sync_api import sync_playwright
import time

def test_authenticated_past_chats():
    with sync_playwright() as p:
        # Use persistent context to maintain session
        user_data_dir = "/tmp/playwright-session"
        browser = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        page = browser.pages[0] if browser.pages else browser.new_page()

        # Collect console messages
        console_messages = []
        def handle_console(msg):
            text = msg.text
            console_messages.append({
                "type": msg.type,
                "text": text
            })
            # Print immediately for debugging
            print(f"  [{msg.type}] {text}")

        page.on("console", handle_console)

        # Collect errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            print("🌐 Navigating to http://localhost:3001")
            page.goto('http://localhost:3001', wait_until='networkidle')
            time.sleep(2)

            print("\n📸 Current page screenshot...")
            page.screenshot(path='/tmp/current-page.png')

            # Check if we need to sign in
            signin_button = page.query_selector('text=Sign in with Google')
            if signin_button:
                print("\n⚠️  Not authenticated. Please:")
                print("  1. The browser window will stay open")
                print("  2. Click 'Sign in with Google' and complete authentication")
                print("  3. After signing in, press Enter here to continue...")
                input("Press Enter after you've signed in...")
                page.reload(wait_until='networkidle')
                time.sleep(2)

            # Navigate to personas page
            print("\n👥 Navigating to personas page...")
            page.goto('http://localhost:3001/personas', wait_until='networkidle')
            time.sleep(5)  # Give extra time for side panel to load

            print("\n📸 Taking screenshot of personas page...")
            page.screenshot(path='/tmp/authenticated-personas.png')

            # Check the page HTML for side panel
            html = page.content()
            has_past_chats = 'Past Chats' in html
            print(f"\n🔍 'Past Chats' text in HTML: {has_past_chats}")

            # Try to find the side panel
            side_panel = page.query_selector('aside')
            if side_panel:
                print("✅ Side panel (aside) element found")
                side_panel_html = page.evaluate('(el) => el.outerHTML', side_panel)
                print(f"  Side panel HTML length: {len(side_panel_html)} chars")

                # Check for past chats section
                past_chats_heading = page.query_selector('text=Past Chats')
                if past_chats_heading:
                    print("✅ 'Past Chats' heading found")
                else:
                    print("❌ 'Past Chats' heading NOT found")

                # Check for loading state
                loading_text = page.query_selector('text=Loading...')
                if loading_text:
                    print("⏳ Loading state found")

                # Check for no chats message
                no_chats = page.query_selector('text=No past chats yet')
                if no_chats:
                    print("📭 'No past chats yet' message found")
            else:
                print("❌ Side panel (aside) element NOT found")

            print("\n📋 All console messages related to loading chats:")
            chat_logs = [msg for msg in console_messages if 'chat' in msg['text'].lower() or 'conversation' in msg['text'].lower() or 'session' in msg['text'].lower()]
            if chat_logs:
                for msg in chat_logs:
                    print(f"  [{msg['type']}] {msg['text']}")
            else:
                print("  (No chat-related logs found)")

            if errors:
                print("\n❌ JavaScript Errors:")
                for err in errors:
                    print(f"  {err}")

            print("\n✅ Test complete!")
            print("📸 Screenshots saved to /tmp/")
            print("\n⏸️  Browser will stay open for 30 seconds for inspection...")
            time.sleep(30)

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            import traceback
            traceback.print_exc()

        finally:
            browser.close()

if __name__ == "__main__":
    test_authenticated_past_chats()
