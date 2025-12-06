const { Resend } = require("resend");

let resend;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("⚠️  RESEND_API_KEY is missing. Email functionality will be disabled.");
  // Mock object to prevent server crash
  resend = {
    emails: {
      send: async () => {
        console.warn("⚠️  Email sending skipped: RESEND_API_KEY is missing.");
        return { error: { message: "RESEND_API_KEY is missing" } };
      }
    }
  };
}

module.exports = resend;
