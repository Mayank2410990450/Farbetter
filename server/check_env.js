require('dotenv').config();
console.log("RESEND_FROM_EMAIL exists:", !!process.env.RESEND_FROM_EMAIL);
if (process.env.RESEND_FROM_EMAIL) {
    console.log("RESEND_FROM_EMAIL value:", process.env.RESEND_FROM_EMAIL);
}
