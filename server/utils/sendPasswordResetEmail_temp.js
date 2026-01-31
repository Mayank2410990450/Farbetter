
/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<void>}
 */
exports.sendPasswordResetEmail = async (user, resetUrl) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("⚠️  Resend API key not configured. Skipping password reset email.");
            return;
        }

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>You received this email because you requested a password reset for your account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <div class="footer">
            <p>&copy; 2024 Farbetter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        let fromAddress = process.env.RESEND_FROM_EMAIL || "Farbetter <support@farbetterstore.com>";
        if (fromAddress) fromAddress = fromAddress.replace(/["']/g, "").trim();

        await resend.emails.send({
            from: fromAddress,
            to: user.email,
            subject: "Password Reset Request",
            html: htmlContent,
        });

        console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (error) {
        console.error("Failed to send password reset email:", error.message);
    }
};
