from playwright.sync_api import sync_playwright
import json
import time

def debug_session():
    with sync_playwright() as p:
        # Connect to the Chrome browser you're using
        # First, let's try to use a persistent context with your Chrome profile
        browser = p.chromium.launch(
            headless=False,
            channel="chrome"  # Use your installed Chrome
        )
        context = browser.new_context()
        page = context.new_page()

        # Collect all console messages
        console_messages = []
        def handle_console(msg):
            text = msg.text
            msg_type = msg.type
            console_messages.append({
                "type": msg_type,
                "text": text
            })
            # Print immediately
            if 'chat' in text.lower() or 'conversation' in text.lower() or 'session' in text.lower() or 'loading' in text.lower():
                print(f"🔍 [{msg_type}] {text}")

        page.on("console", handle_console)

        # Collect errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            print("🌐 Navigating to http://localhost:3001/personas")
            print("⏳ Waiting for page to load...\n")

            page.goto('http://localhost:3001/personas', wait_until='networkidle')

            # Wait a bit for async operations
            time.sleep(5)

            print("\n" + "="*60)
            print("📋 ALL CONSOLE MESSAGES:")
            print("="*60)
            for i, msg in enumerate(console_messages, 1):
                print(f"{i}. [{msg['type']}] {msg['text']}")

            print("\n" + "="*60)
            print("🔍 FILTERED MESSAGES (chat/session related):")
            print("="*60)
            relevant = [m for m in console_messages if any(keyword in m['text'].lower() for keyword in ['chat', 'conversation', 'session', 'loading', 'user'])]
            if relevant:
                for msg in relevant:
                    print(f"[{msg['type']}] {msg['text']}")
            else:
                print("(None found)")

            if errors:
                print("\n" + "="*60)
                print("❌ JAVASCRIPT ERRORS:")
                print("="*60)
                for err in errors:
                    print(err)

            # Check DOM for past chats section
            print("\n" + "="*60)
            print("🔍 DOM INSPECTION:")
            print("="*60)

            # Check if side panel exists
            side_panel = page.query_selector('aside')
            if side_panel:
                print("✅ Side panel exists")

                # Check for Past Chats heading
                past_chats = page.query_selector('text=Past Chats')
                if past_chats:
                    print("✅ 'Past Chats' heading found")

                    # Get all text in the aside element
                    aside_text = page.evaluate('(el) => el.innerText', side_panel)
                    print("\n📄 Side panel text content:")
                    print(aside_text)
                else:
                    print("❌ 'Past Chats' heading NOT found")
            else:
                print("❌ Side panel NOT found")

            # Check if user is authenticated
            sign_in_button = page.query_selector('text=Sign In')
            if sign_in_button:
                print("\n⚠️  User appears to be NOT authenticated (Sign In button visible)")
            else:
                print("\n✅ User appears to be authenticated (No Sign In button)")

            print("\n📸 Taking screenshot...")
            page.screenshot(path='/tmp/debug-session.png', full_page=True)
            print("Screenshot saved to /tmp/debug-session.png")

            print("\n⏸️  Keeping browser open for 20 seconds for inspection...")
            time.sleep(20)

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

        finally:
            browser.close()

if __name__ == "__main__":
    debug_session()
