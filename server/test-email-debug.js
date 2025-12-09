require('dotenv').config();
const { Resend } = require('resend');

async function testEmail() {
    console.log("--- Email Debug Info ---");
    // Show first few chars of API key if present to verify it's loaded but keep it secure-ish
    const key = process.env.RESEND_API_KEY;
    console.log("RESEND_API_KEY present:", !!key);
    if (key) console.log("RESEND_API_KEY prefix:", key.substring(0, 5) + "...");

    console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "(not set, will use default)");
    console.log("SUPPORT_EMAIL:", process.env.SUPPORT_EMAIL || "(not set)");

    if (!key) {
        console.error("❌ No API Key found.");
        return;
    }

    const resend = new Resend(key);

    // We'll try to send to a generic address. 
    // If the account is in sandbox mode, this will fail with a specific message telling us 'only allowed to send to...'.
    // If it succeeds, then the system is working (and the user probably just checked their spam folder or has a different issue).
    const toEmail = "delivered@resend.dev"; // Resend's test sink address

    console.log(`Attempting to send email to ${toEmail}...`);

    try {
        const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Farbetter <onboarding@resend.dev>',
            to: toEmail,
            subject: 'Debug Test Email',
            html: '<p>This is a debug email to verify configuration.</p>'
        });

        console.log("Result:", result);

        if (result.error) {
            console.error("❌ API returned error object:", result.error);
        } else if (result.id) {
            console.log("✅ API returned success ID:", result.id);
        }
    } catch (err) {
        console.error("❌ Exception during send:", err.message);
        if (err.response && err.response.data) {
            console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
        }
    }
}

testEmail();
