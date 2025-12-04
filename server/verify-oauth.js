require('dotenv').config();

console.log('\n🔍 Verifying Google OAuth Configuration...\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
const callbackUrl = `${serverUrl}/api/auth/google/callback`;

console.log('1️⃣  Environment Variables:');
if (clientId) console.log('   ✅ GOOGLE_CLIENT_ID is set');
else console.error('   ❌ GOOGLE_CLIENT_ID is MISSING');

if (clientSecret) console.log('   ✅ GOOGLE_CLIENT_SECRET is set');
else console.error('   ❌ GOOGLE_CLIENT_SECRET is MISSING');

console.log('\n2️⃣  Constructed Callback URL:');
console.log(`   👉 ${callbackUrl}`);
console.log('\n   ⚠️  This URL MUST match exactly in Google Cloud Console!');

console.log('\n3️⃣  Next Steps:');
console.log('   1. Go to https://console.cloud.google.com/apis/credentials');
console.log('   2. Edit your OAuth 2.0 Client ID');
console.log('   3. Ensure "Authorized redirect URIs" contains EXACTLY:');
console.log(`      ${callbackUrl}`);
console.log('   4. Save and wait 5 minutes.');

console.log('\nDone.\n');
