
require('dotenv').config();
const { Resend } = require('resend');

async function testRealEmail() {
    console.log("--- Real Email Send Test (Updated) ---");
    const key = process.env.RESEND_API_KEY;
    const destEmail = process.env.SUPPORT_EMAIL;

    if (!key) {
        console.error("❌ No RESEND_API_KEY found.");
        return;
    }

    // Explicitly use the new sender address to verify
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Farbetter <support@farbetterstore.com>';

    console.log(`Using Key: ${key.substring(0, 5)}...`);
    console.log(`FROM: ${fromEmail}`);
    console.log(`TO: ${destEmail}`);

    const resend = new Resend(key);

    try {
        const result = await resend.emails.send({
            from: fromEmail,
            to: destEmail,
            subject: 'Test Email from Subdomain',
            html: '<p>This email tests the new @send.farbetterstore.com configuration. If you see this, the domain verification is working!</p>'
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

testRealEmail();
