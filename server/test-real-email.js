
require('dotenv').config();
const { Resend } = require('resend');

async function testRealEmail() {
    console.log("--- Real Email Send Test ---");
    const key = process.env.RESEND_API_KEY;
    const destEmail = process.env.SUPPORT_EMAIL;

    if (!key) {
        console.error("❌ No RESEND_API_KEY found.");
        return;
    }
    if (!destEmail) {
        console.error("❌ No SUPPORT_EMAIL found in .env to test with.");
        return;
    }

    const resend = new Resend(key);

    console.log(`Attempting to send email FROM ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'} TO ${destEmail}...`);

    try {
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Farbetter <onboarding@resend.dev>',
            to: destEmail,
            subject: 'Real User Email Test',
            html: '<p>If you receive this, the email system is fully working for real users.</p>'
        });

        console.log("Result:", result);

        if (result.error) {
            console.error("❌ API returned error object:", result.error);
        } else if (result.id) {
            console.log("✅ API returned success ID:", result.id);
            console.log("If you don't see the email in your inbox, checks SPAM folder.");
        }
    } catch (err) {
        console.error("❌ Exception during send:", err.message);
        if (err.response && err.response.data) {
            console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
        }
    }
}

testRealEmail();
