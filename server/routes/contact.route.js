const express = require('express');
const router = express.Router();
const resend = require('../config/email');

// Contact form email endpoint
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is configured (using the same vars as the rest of the app)
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured.');
      return res.status(200).json({
        message: 'Thank you for your message. We will contact you soon.',
        warning: 'Email service not configured'
      });
    }

    // Send email to admin/support
    // Send email to admin/support
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Farbetter Contact <onboarding@resend.dev>",
      to: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'Farbetterstore@gmail.com',
      reply_to: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Also send confirmation email to user
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Farbetter <onboarding@resend.dev>",
      to: email,
      subject: 'We received your message - Farbetter',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Farbetter Team</p>
      `,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
