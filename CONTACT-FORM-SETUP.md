# Contact Form Setup Guide

The Contact Us feature has been successfully implemented! Here's what was added:

## Files Created/Modified

1. **`components/ContactModal.jsx`** - Contact form modal component
2. **`pages/api/contact.js`** - API endpoint to send emails
3. **`pages/index.js`** - Updated to include Contact Us button
4. **`.env.local`** - Added Gmail configuration variables

## Features

- ✅ Contact Us button in homepage top-right corner
- ✅ Modal form with name, email, and message fields
- ✅ Form validation (required fields, email format)
- ✅ Success/error message display
- ✅ Auto-close modal on successful submission
- ✅ Sends emails to mahalegauravk@gmail.com

## Gmail Configuration Required

To enable email sending, you need to configure Gmail App Password:

### Step 1: Create Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Google account (mahalegauravk@gmail.com)
3. Create a new App Password:
   - App name: "AI-Spirit Contact Form"
   - Click "Create"
4. Copy the 16-character password generated

### Step 2: Update Environment Variables

Open `.env.local` and update these values:

```env
GMAIL_USER=mahalegauravk@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password-here
```

**Important**: Use the App Password, NOT your regular Gmail password!

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Testing

1. Open http://localhost:3000
2. Click "Contact Us" button in top-right corner
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Message: This is a test message
4. Click "Send Message"
5. You should see a success message
6. Check mahalegauravk@gmail.com inbox for the email

## Email Format

Emails sent from the contact form will have:
- **From**: Your configured Gmail account
- **To**: mahalegauravk@gmail.com
- **Reply-To**: User's email (so you can reply directly)
- **Subject**: AI-Spirit Contact Form: Message from [Name]
- **Body**: Formatted HTML with user's name, email, and message

## Security Notes

- The API validates all input fields
- Email addresses are validated using regex
- The Gmail App Password is stored in `.env.local` (not committed to git)
- `.env.local` is in `.gitignore` to prevent credential leaks

## Troubleshooting

**If emails are not sending:**

1. Check that `.env.local` has the correct Gmail credentials
2. Verify the App Password is 16 characters (no spaces)
3. Restart the development server after changing `.env.local`
4. Check the browser console for errors
5. Check the server terminal for error messages

**If you see "Authentication failed":**
- You're using your regular password instead of an App Password
- Generate a new App Password from Google Account settings

**If the modal doesn't open:**
- Check browser console for errors
- Verify ContactModal.jsx was created correctly
