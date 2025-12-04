const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} catch (err) {
  console.error('Failed to initialize email transporter:', err);
}

// Contact form email endpoint
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service not configured. Credentials missing.');
      // Still return success so form submits, but log the issue
      return res.status(200).json({ 
        message: 'Thank you for your message. We will contact you soon.',
        warning: 'Email service not configured' 
      });
    }

    if (!transporter) {
      return res.status(500).json({ message: 'Email service unavailable' });
    }

    // Send email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL || 'Farbetterstore@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    };

    // Also send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
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
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
