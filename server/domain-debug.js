require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function manageDomains() {
    console.log("🔍 Checking Resend Domains...");

    try {
        // 1. List Domains
        const listResponse = await resend.domains.list();

        if (listResponse.error) {
            console.error("❌ Error listing domains:", listResponse.error);
            return;
        }

        const domains = listResponse.data.data;
        console.log(`📋 Found ${domains.length} domains.`);

        const myDomainName = 'farbetterstore.com';
        let myDomain = domains.find(d => d.name === myDomainName);

        // 2. Create if missing
        if (!myDomain) {
            console.log(`⚠️ Domain ${myDomainName} not found. Creating...`);
            const createResponse = await resend.domains.create({ name: myDomainName });

            if (createResponse.error) {
                console.error("❌ Failed to create domain:", createResponse.error);
                return;
            }
            console.log("✅ Domain created:", createResponse.data);
            myDomain = { id: createResponse.data.id, name: myDomainName };
        } else {
            console.log(`✅ Domain '${myDomainName}' found (ID: ${myDomain.id}). Status: ${myDomain.status}`);
        }

        // 3. Get details
        const getResponse = await resend.domains.get(myDomain.id);
        const domainDetails = getResponse.data;

        console.log("\n--- Domain Details ---");
        console.log(`Status: ${domainDetails.status}`);
        console.log(`Region: ${domainDetails.region}`);

        if (domainDetails.status !== 'verified') {
            console.log("⚠️ Domain not verified. Attemping verification...");
            await resend.domains.verify(myDomain.id);
            console.log("✅ Verification request sent. Please check your DNS records.");

            console.log("\n--- Required DNS Records ---");
            domainDetails.records.forEach(record => {
                console.log(`Type: ${record.record}\nName: ${record.name}\nValue: ${record.value}\nStatus: ${record.status || 'Unknown'}\n-------------------`);
            });
        } else {
            console.log("🎉 Domain is fully VERIFIED and ready to send emails!");

            // Update Domain Settings (Requested by User)
            console.log("⚙️  Updating Domain Settings (Click Tracking: ON, Open Tracking: OFF)...");
            const updateResponse = await resend.domains.update({
                id: myDomain.id,
                openTracking: false,
                clickTracking: true,
            });

            if (updateResponse.error) {
                console.error("❌ Failed to update domain settings:", updateResponse.error);
            } else {
                console.log("✅ Domain settings updated successfully:", updateResponse.data);
            }
        }

    } catch (error) {
        console.error("❌ Script error:", error.message);
    }
}

manageDomains();
