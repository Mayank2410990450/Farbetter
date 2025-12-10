const resend = require('../config/email');

exports.testEmail = async (req, res) => {
    try {
        const { email } = req.query;
        // Use query param or fallback to support email or hardcode for safety
        const targetEmail = email || process.env.SUPPORT_EMAIL || 'farbetterstore@gmail.com';

        console.log(`🔍 Debug: Attempting to send email to ${targetEmail}`);

        const htmlContent = `
      <h1>Test Email</h1>
      <p>This is a test email triggered from the debug endpoint.</p>
      <h3>Environment Check:</h3>
      <pre>${JSON.stringify({
            timestamp: new Date().toISOString(),
            RESEND_API_KEY_CONFIGURED: !!process.env.RESEND_API_KEY,
            RESEND_FROM_EMAIL_VAR: process.env.RESEND_FROM_EMAIL || '(not set)',
            SUPPORT_EMAIL_VAR: process.env.SUPPORT_EMAIL || '(not set)',
            NODE_ENV: process.env.NODE_ENV
        }, null, 2)}</pre>
    `;

        // Attempt Send
        let fromAddress = process.env.RESEND_FROM_EMAIL || "Farbetter <support@farbetterstore.com>";

        // Sanitize: Remove extra quotes if user added them in Render dashboard
        fromAddress = fromAddress.replace(/["']/g, "").trim();

        console.log(`🔍 Debug: Sending FROM: [${fromAddress}]`);

        const data = await resend.emails.send({
            from: fromAddress,
            to: targetEmail,
            subject: "Test Email - Debug Endpoint",
            html: htmlContent
        });

        if (data.error) {
            console.error("❌ Resend API Error:", data.error);
            return res.status(422).json({
                success: false,
                message: "Resend API returned an error",
                error: data.error,
                envCheck: {
                    apikey_exists: !!process.env.RESEND_API_KEY,
                    attemptedFrom: fromAddress
                }
            });
        }

        res.json({
            success: true,
            data,
            message: `Email sent to ${targetEmail}`,
            sentFrom: fromAddress
        });

    } catch (error) {
        console.error("❌ Server Error in /test-email:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};
