/**
 * Quick GoHighLevel Webhook Test
 * Send a sample Yelp lead to your GHL webhook
 */

// Sample Yelp lead data
const yelpLead = {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@gmail.com", 
    phone: "(604) 555-0123",
    address: "456 Oak Street, Vancouver, BC",
    notes: "Hi, I found you on Yelp and need roof cleaning. My roof has moss buildup and I'd like a quote. Please call me!",
    source: "yelp",
    medium: "business_profile",
    campaign: "yelp_lead_test",
    tags: ["yelp-lead", "roof-cleaning", "vancouver", "test"],
    serviceType: "roof_cleaning",
    propertyType: "residential",
    urgency: "high"
};

// Your GoHighLevel webhook URL
const webhookUrl = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';

console.log('🚀 Testing GoHighLevel webhook with Yelp lead data...\n');
console.log('📋 Sample Lead:', JSON.stringify(yelpLead, null, 2));

// Send to webhook
fetch(webhookUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BigTruss-Test/1.0'
    },
    body: JSON.stringify(yelpLead)
})
.then(response => {
    console.log(`\n📡 Response Status: ${response.status}`);
    return response.text();
})
.then(data => {
    console.log('📊 Response Data:', data);
    
    if (data.includes('success') || data.includes('Success')) {
        console.log('\n✅ SUCCESS! Lead sent to GoHighLevel');
        console.log('🎯 Check your GoHighLevel dashboard for the new lead');
    } else {
        console.log('\n⚠️ Response received, check GoHighLevel to verify');
    }
})
.catch(error => {
    console.log('\n❌ Error:', error.message);
    console.log('🚨 Check your webhook URL and internet connection');
});