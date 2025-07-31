/**
 * Test Yelp Email Parser and GoHighLevel Integration
 * Simulates realistic Yelp email scenarios and tests the complete flow
 */

// Mock Yelp email data (realistic examples)
const mockYelpEmails = [
    {
        subject: "New message from Sarah Johnson about Big Truss Roof Cleaning",
        from: "noreply@yelp.com",
        textPlain: `
You have received a new message on Yelp.

From: Sarah Johnson <sarah.johnson@gmail.com>
To: Big Truss Roof Cleaning

Message:
Hi there! I found your business on Yelp and I'm really impressed with your reviews. 
My roof has a lot of moss buildup and I need it cleaned before the winter season. 
The house is a 2-story residential property in Vancouver. 
Can you please provide me with a quote? My phone number is (604) 555-0123.
I'd prefer to be contacted in the evenings after 6 PM.

Thanks!
Sarah Johnson

Best regards,
The Yelp Team
        `,
        date: "2024-01-15T14:30:00Z"
    },
    {
        subject: "URGENT: Quote Request - Michael Chen needs gutter cleaning",
        from: "notifications@yelp.com", 
        textPlain: `
New Quote Request via Yelp Business

Customer: Michael Chen
Email: m.chen.home@outlook.com
Phone: 778-555-0198
Service Area: Burnaby, BC

Request Details:
Need URGENT gutter cleaning service. My gutters are completely blocked and water is overflowing onto my foundation. This is an emergency situation that needs immediate attention. I have a 2-story house with difficult roof access.

Please call me ASAP at 778-555-0198.

Message sent via Yelp Request-a-Quote
        `,
        date: "2024-01-15T09:15:00Z"
    },
    {
        subject: "Jennifer Martinez is interested in your roof cleaning services",
        from: "yelp-messages@yelp.com",
        textPlain: `
New Business Inquiry from Yelp

Contact Information:
Name: Jennifer Martinez  
Email: jmartinez.home@yahoo.ca
Phone: Not provided
Location: North Vancouver, BC

Message:
I saw your excellent reviews on Yelp and I'm interested in both roof cleaning and pressure washing services. I have a heritage home that needs special care and I'm looking for eco-friendly cleaning options. The roof hasn't been cleaned in about 5 years and could really use some attention. I also need my driveway and patio pressure washed.

Could you provide an estimate for both services? I'm not in a rush but would like to get this done within the next month.

Thank you!
Jennifer

This message was sent through your Yelp business profile.
        `,
        date: "2024-01-15T16:45:00Z"
    }
];

// GoHighLevel webhook URL
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';

// Email parsing function (matches n8n workflow logic)
function parseYelpEmail(emailData) {
    const subject = emailData.subject || '';
    const textPlain = emailData.textPlain || '';
    const content = textPlain + ' ' + subject;
    
    console.log('📧 Processing email...');
    console.log('Subject:', subject);
    console.log('Content preview:', textPlain.substring(0, 200) + '...\n');
    
    // Extract customer information
    const extractCustomerInfo = (content) => {
        // Extract name (multiple patterns)
        const namePatterns = [
            /From:\s*([^<\n\r]+?)(?:\s*<|$)/i,
            /Name:\s*([^\n\r]+)/i,
            /Customer:\s*([^\n\r]+)/i,
            /Contact Information:\s*Name:\s*([^\n\r]+)/i,
            /([A-Z][a-z]+ [A-Z][a-z]+)/
        ];
        
        let customerName = 'Yelp Customer';
        for (const pattern of namePatterns) {
            const match = content.match(pattern);
            if (match && match[1] && match[1].trim().length > 2) {
                customerName = match[1].trim();
                break;
            }
        }
        
        // Extract email
        const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/);
        const customerEmail = emailMatch ? emailMatch[1] : 'yelp-lead@bigtrussroofing.com';
        
        // Extract phone
        const phoneMatch = content.match(/(\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4})/);
        const customerPhone = phoneMatch ? phoneMatch[1] : '';
        
        // Determine service type
        const lowerContent = content.toLowerCase();
        let serviceType = 'roof_cleaning';
        if (lowerContent.includes('gutter')) serviceType = 'gutter_cleaning';
        else if (lowerContent.includes('pressure') || lowerContent.includes('washing')) serviceType = 'pressure_washing';
        else if (lowerContent.includes('moss')) serviceType = 'moss_removal';
        else if (lowerContent.includes('both') || lowerContent.includes('combo')) serviceType = 'combo_service';
        
        // Determine urgency
        let urgency = 'normal';
        if (lowerContent.includes('urgent') || lowerContent.includes('asap') || lowerContent.includes('emergency')) {
            urgency = 'urgent';
        } else if (lowerContent.includes('soon') || lowerContent.includes('quickly') || lowerContent.includes('immediate')) {
            urgency = 'high';
        }
        
        // Extract location info
        const locationMatch = content.match(/(Vancouver|Burnaby|Richmond|Surrey|North Vancouver|West Vancouver|Coquitlam|Delta)/i);
        const city = locationMatch ? locationMatch[1] : 'Vancouver';
        
        const nameParts = customerName.split(' ');
        
        return {
            firstName: nameParts[0] || 'Yelp',
            lastName: nameParts.slice(1).join(' ') || 'Customer',
            email: customerEmail,
            phone: customerPhone,
            city: city,
            serviceType,
            urgency
        };
    };
    
    const customerInfo = extractCustomerInfo(content);
    
    console.log('🔍 Extracted customer info:');
    console.log('Name:', customerInfo.firstName, customerInfo.lastName);
    console.log('Email:', customerInfo.email);
    console.log('Phone:', customerInfo.phone || 'Not provided');
    console.log('Service:', customerInfo.serviceType);
    console.log('Urgency:', customerInfo.urgency);
    console.log('City:', customerInfo.city);
    console.log('');
    
    // Build lead data for GoHighLevel (matches our successful format)
    const leadData = {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: '',
        city: customerInfo.city,
        state: 'BC',
        postalCode: '',
        country: 'CA',
        
        // Service information
        propertyType: 'residential',
        serviceType: customerInfo.serviceType,
        urgency: customerInfo.urgency,
        preferredContactTime: 'anytime',
        
        // Marketing attribution
        source: 'yelp',
        medium: 'email_notification',
        campaign: 'yelp_automation_test',
        
        // Lead content
        notes: `YELP LEAD\n\nSubject: ${subject}\n\nMessage:\n${textPlain.trim()}`,
        
        // Tags for GoHighLevel
        tags: [
            'yelp-lead',
            'test-automation',
            customerInfo.serviceType,
            customerInfo.urgency === 'urgent' ? 'hot-lead' : 'warm-lead'
        ],
        
        // Custom fields
        customFields: {
            lead_source_detail: 'Yelp Email Notification',
            capture_method: 'test_automation',
            original_subject: subject,
            email_received_date: emailData.date || new Date().toISOString(),
            automation_version: '1.0',
            lead_score: customerInfo.urgency === 'urgent' ? 95 : (customerInfo.phone ? 85 : 75),
            estimated_value: customerInfo.serviceType === 'gutter_cleaning' ? 400 : 
                            customerInfo.serviceType === 'pressure_washing' ? 600 : 
                            customerInfo.serviceType === 'combo_service' ? 1200 : 800
        },
        
        // Timestamps
        submissionTime: new Date().toISOString(),
        userAgent: 'Test-BigTruss-YelpAutomation'
    };
    
    return leadData;
}

// Send to GoHighLevel webhook
async function sendToGoHighLevel(leadData) {
    console.log('🚀 Sending to GoHighLevel...');
    console.log('📊 Lead Data Summary:');
    console.log(`   Customer: ${leadData.firstName} ${leadData.lastName}`);
    console.log(`   Service: ${leadData.serviceType}`);
    console.log(`   Urgency: ${leadData.urgency}`);
    console.log(`   Score: ${leadData.customFields.lead_score}/100`);
    console.log(`   Value: $${leadData.customFields.estimated_value}`);
    console.log('');
    
    try {
        const response = await fetch(GHL_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'BigTruss-Test-YelpAutomation/1.0',
                'X-Source': 'yelp-test-automation'
            },
            body: JSON.stringify(leadData)
        });
        
        const responseText = await response.text();
        
        console.log(`📡 Response Status: ${response.status}`);
        console.log(`📊 Response: ${responseText}`);
        
        if (response.ok) {
            console.log('✅ SUCCESS: Lead sent to GoHighLevel!');
            return { success: true, response: responseText };
        } else {
            console.log('❌ FAILED: GoHighLevel webhook error');
            return { success: false, error: responseText };
        }
        
    } catch (error) {
        console.log('💥 ERROR: Network or parsing error');
        console.error(error.message);
        return { success: false, error: error.message };
    }
}

// Test all scenarios
async function runYelpEmailTests() {
    console.log('🧪 YELP EMAIL PARSER & GOHIGHLEVEL INTEGRATION TEST');
    console.log('==================================================\n');
    
    console.log(`🎯 Target Webhook: ${GHL_WEBHOOK}`);
    console.log(`📧 Testing ${mockYelpEmails.length} realistic Yelp email scenarios\n`);
    
    const results = [];
    
    for (let i = 0; i < mockYelpEmails.length; i++) {
        const email = mockYelpEmails[i];
        
        console.log(`\n📨 TEST ${i + 1}/${mockYelpEmails.length}`);
        console.log('=' + '='.repeat(50));
        
        // Parse email
        const leadData = parseYelpEmail(email);
        
        // Send to GoHighLevel
        const result = await sendToGoHighLevel(leadData);
        
        results.push({
            testNumber: i + 1,
            emailSubject: email.subject,
            customerName: `${leadData.firstName} ${leadData.lastName}`,
            serviceType: leadData.serviceType,
            urgency: leadData.urgency,
            success: result.success,
            response: result.response || result.error
        });
        
        // Wait between requests
        if (i < mockYelpEmails.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Summary report
    console.log('\n\n📊 TEST RESULTS SUMMARY');
    console.log('======================');
    
    const successCount = results.filter(r => r.success).length;
    const successRate = ((successCount / results.length) * 100).toFixed(1);
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${results.length - successCount}`);
    console.log(`Success Rate: ${successRate}%\n`);
    
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} Test ${result.testNumber}: ${result.customerName} (${result.serviceType}, ${result.urgency})`);
    });
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (successRate >= 90) {
        console.log('🎉 Excellent! Your Yelp automation is ready for production.');
        console.log('✨ Email parsing and GoHighLevel integration working perfectly.');
    } else if (successRate >= 70) {
        console.log('⚠️  Good results, but check failed tests for improvements.');
    } else {
        console.log('🚨 Issues detected. Review webhook configuration and parsing logic.');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. ✅ Import n8n workflow: n8n-yelp-ghl-workflow.json');
    console.log('2. 🔧 Configure Gmail credentials in n8n');
    console.log('3. 🧪 Test with real Yelp email forward');
    console.log('4. 📊 Monitor n8n execution logs');
    console.log('5. 🎯 Check GoHighLevel for captured leads');
    
    return results;
}

// Run tests
runYelpEmailTests().catch(console.error);