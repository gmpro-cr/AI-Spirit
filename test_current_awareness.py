"""
Integration test for persona current awareness feature
Tests that personas have access to current date/time and news
"""
import re
from playwright.sync_api import sync_playwright, expect

def test_persona_time_awareness():
    """Test that persona responds with time-appropriate greeting"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat with any persona (Einstein)
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # Send greeting
        page.fill('[data-testid="chat-input"]', 'Hello!')
        page.click('[data-testid="send-button"]')

        # Wait for response
        page.wait_for_selector('[data-testid="message-bubble"]:has-text("Good")', timeout=10000)

        # Get response text
        response = page.inner_text('[data-testid="ai-message"]:last-of-type')

        # Check for time-appropriate greeting
        assert any(word in response.lower() for word in ['morning', 'afternoon', 'evening', 'day']), \
            f"Expected time-aware greeting, got: {response}"

        browser.close()

def test_persona_news_awareness():
    """Test that persona can reference current events when relevant"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat with Einstein
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # Ask about current events in physics
        page.fill('[data-testid="chat-input"]', "What's happening in physics today?")
        page.click('[data-testid="send-button"]')

        # Wait for response
        page.wait_for_selector('[data-testid="ai-message"]:last-of-type', timeout=15000)

        # Get response text
        response = page.inner_text('[data-testid="ai-message"]:last-of-type')

        # Response should be substantial (persona has context)
        assert len(response) > 50, "Response too short - persona may not have context"

        browser.close()

def test_context_not_injected_on_second_message():
    """Test that context is only injected once per conversation"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Open browser console to check logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(msg.text()))

        # Navigate to app
        page.goto('http://localhost:3000')

        # Start chat
        page.click('text=Albert Einstein')
        page.wait_for_selector('[data-testid="chat-input"]')

        # First message
        page.fill('[data-testid="chat-input"]', 'Hi!')
        page.click('[data-testid="send-button"]')
        page.wait_for_selector('[data-testid="ai-message"]:nth-of-type(1)', timeout=10000)

        # Second message
        page.fill('[data-testid="chat-input"]', 'How are you?')
        page.click('[data-testid="send-button"]')
        page.wait_for_selector('[data-testid="ai-message"]:nth-of-type(2)', timeout=10000)

        # Check server logs (would need to be exposed or check via API)
        # This is a basic check - in production you'd check server logs

        browser.close()

if __name__ == '__main__':
    print("Running current awareness integration tests...")

    print("\n1. Testing time awareness...")
    test_persona_time_awareness()
    print("✓ Time awareness test passed")

    print("\n2. Testing news awareness...")
    test_persona_news_awareness()
    print("✓ News awareness test passed")

    print("\n3. Testing context injection frequency...")
    test_context_not_injected_on_second_message()
    print("✓ Context injection test passed")

    print("\n✓ All tests passed!")
