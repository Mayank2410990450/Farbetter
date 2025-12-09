// config/email.js
const { Resend } = require("resend");

let resend;

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY is missing. Emails will not be sent.");

  // Safe mock object so app does not crash
  resend = {
    emails: {
      send: async () => {
        console.warn("⚠️ Email skipped: RESEND_API_KEY not configured.");
        return { id: null, skipped: true };
      },
    },
  };
} else {
  resend = new Resend(process.env.RESEND_API_KEY);
}

module.exports = resend;
