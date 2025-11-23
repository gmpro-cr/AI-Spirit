import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// HTML escape function to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message } = req.body

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  // Strict email validation (prevent header injection)
  if (!email.match(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) ||
      email.includes('\n') || email.includes('\r')) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  // Sanitize inputs
  const safeName = escapeHtml(name.slice(0, 100))
  const safeEmail = escapeHtml(email.slice(0, 100))
  const safeMessage = escapeHtml(message.slice(0, 5000))

  try {
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'AI-Spirit <onboarding@resend.dev>', // Use Resend's test domain
      to: 'mahalegauravk@gmail.com',
      replyTo: email,
      subject: `AI-Spirit Contact Form: Message from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="color: #888; font-size: 12px;">
            This message was sent from the AI-Spirit contact form.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Error sending email:', error)
      return res.status(500).json({ error: 'Failed to send message. Please try again later.' })
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' })
  }
}
