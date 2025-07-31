/**
 * Yelp to GoHighLevel Webhook Test Suite
 * Tests the webhook integration with Yelp-formatted lead data
 */

import GoHighLevelWebhook from './gohighlevel-webhook-integration.js';

class YelpWebhookTester {
    constructor() {
        this.ghlWebhook = new GoHighLevelWebhook();
        this.testResults = [];
    }

    /**
     * Generate sample Yelp lead data
     */
    generateYelpLeadData() {
        const sampleLeads = [
            {
                // Email-parsed Yelp lead
                firstName: "Sarah",
                lastName: "Johnson", 
                email: "sarah.johnson@gmail.com",
                phone: "(604) 555-0123",
                address: "456 Oak Street, Vancouver, BC V6H 2M3",
                notes: "Hi, I'm interested in getting a quote for roof cleaning. My roof has a lot of moss buildup and I'd like to get it cleaned before winter. Please call me to discuss pricing.",
                source: "yelp",
                medium: "email_notification",
                campaign: "yelp_automation",
                serviceType: "roof_cleaning",
                propertyType: "residential",
                urgency: "high",
                tags: ["yelp-lead", "roof-cleaning", "moss-removal", "vancouver"],
                customFields: {
                    lead_source_detail: "Yelp Business Profile Message",
                    capture_method: "email_parsing",
                    yelp_business_url: "https://www.yelp.com/biz/big-truss-roof-cleaning-vancouver",
                    estimated_value: 800,
                    lead_score: 85,
                    roof_condition: "moss_buildup"
                }
            },
            {
                // Yelp Request-a-Quote lead  
                firstName: "Michael",
                lastName: "Chen",
                email: "m.chen.home@outlook.com", 
                phone: "778-555-0198",
                address: "789 Maple Ave, Burnaby, BC V5H 1K7",
                notes: "Looking for gutter cleaning service. House is 2-story with difficult access. Need estimate ASAP as gutters are overflowing.",
                source: "yelp",
                medium: "quote_request",
                campaign: "yelp_quote_form",
                serviceType: "gutter_cleaning", 
                propertyType: "residential",
                urgency: "urgent",
                tags: ["yelp-lead", "gutter-cleaning", "2-story", "urgent"],
                customFields: {
                    lead_source_detail: "Yelp Quote Request Form",
                    capture_method: "form_submission",
                    property_stories: 2,
                    access_difficulty: "high",
                    estimated_value: 400,
                    lead_score: 92
                }
            },
            {
                // Yelp Review-to-Lead conversion
                firstName: "Jennifer",
                lastName: "Martinez",
                email: "jmartinez.home@yahoo.ca",
                phone: "(778) 555-0234", 
                address: "321 Pine Street, North Vancouver, BC V7G 1B4",
                notes: "Saw your great reviews on Yelp! Need both roof and pressure washing for my heritage home. Would like eco-friendly options.",
                source: "yelp",
                medium: "review_followup", 
                campaign: "yelp_reputation",
                serviceType: "combo_service",
                propertyType: "heritage",
                urgency: "normal",
                tags: ["yelp-lead", "combo-service", "heritage-home", "eco-friendly"],
                customFields: {
                    lead_source_detail: "Yelp Review Follow-up",
                    capture_method: "review_conversion", 
                    property_type_detail: "heritage_home",
                    eco_friendly_required: true,
                    services_requested: ["roof_cleaning", "pressure_washing"],
                    estimated_value: 1200,
                    lead_score: 78
                }
            }
        ];

        return sampleLeads;
    }

    /**
     * Test individual webhook with Yelp data
     */
    async testSingleWebhook(leadData, testName) {
        console.log(`\n🧪 Testing: ${testName}`);
        console.log(`📋 Lead Data:`, JSON.stringify(leadData, null, 2));
        
        try {
            const result = await this.ghlWebhook.sendWebhook(leadData);
            
            this.testResults.push({
                testName,
                leadData,
                result,
                success: result.success,
                timestamp: new Date().toISOString()
            });

            if (result.success) {
                console.log(`✅ ${testName} - SUCCESS`);
                console.log(`📊 Response:`, result);
            } else {
                console.log(`❌ ${testName} - FAILED`);
                console.log(`🚨 Error:`, result.error);
            }

            return result;

        } catch (error) {
            console.log(`💥 ${testName} - EXCEPTION`);
            console.log(`🚨 Error:`, error.message);
            
            this.testResults.push({
                testName,
                leadData, 
                result: { success: false, error: error.message },
                success: false,
                timestamp: new Date().toISOString()
            });

            return { success: false, error: error.message };
        }
    }

    /**
     * Run all Yelp webhook tests
     */
    async runAllTests() {
        console.log('🚀 Starting Yelp to GoHighLevel Webhook Tests...\n');
        console.log(`🎯 Target Webhook: ${this.ghlWebhook.webhookUrl}\n`);

        const sampleLeads = this.generateYelpLeadData();
        
        // Test each lead type
        await this.testSingleWebhook(sampleLeads[0], "Email-Parsed Yelp Lead");
        await this.testSingleWebhook(sampleLeads[1], "Yelp Quote Request Lead");  
        await this.testSingleWebhook(sampleLeads[2], "Yelp Review Follow-up Lead");

        // Test edge cases
        await this.testEdgeCases();

        // Generate report
        this.generateTestReport();
    }

    /**
     * Test edge cases and data validation
     */
    async testEdgeCases() {
        console.log('\n🔍 Testing Edge Cases...');

        // Test with minimal data
        const minimalLead = {
            firstName: "John",
            phone: "555-123-4567",
            source: "yelp",
            notes: "Minimal data test"
        };
        await this.testSingleWebhook(minimalLead, "Minimal Data Test");

        // Test with invalid email
        const invalidEmailLead = {
            firstName: "Jane",
            lastName: "Doe", 
            email: "invalid-email-format",
            phone: "(604) 555-9999",
            source: "yelp",
            notes: "Testing invalid email handling"
        };
        await this.testSingleWebhook(invalidEmailLead, "Invalid Email Test");

        // Test with special characters
        const specialCharsLead = {
            firstName: "José",
            lastName: "O'Brien-Smith",
            email: "jose.obrien@test.com",
            phone: "+1 (778) 555-0000",
            address: "123 Élm Street #4, Montréal, QC",
            notes: "Testing special characters: àáâãäåæçèéêëìíîïñòóôõöøùúûüý",
            source: "yelp",
            tags: ["special-chars", "unicode-test"]
        };
        await this.testSingleWebhook(specialCharsLead, "Special Characters Test");
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        console.log('\n📊 TEST REPORT');
        console.log('==============\n');

        const totalTests = this.testResults.length;
        const successfulTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - successfulTests;
        const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

        console.log(`📈 Overall Results:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Successful: ${successfulTests}`);
        console.log(`   Failed: ${failedTests}`);
        console.log(`   Success Rate: ${successRate}%\n`);

        // Detailed results
        this.testResults.forEach((test, index) => {
            const status = test.success ? '✅' : '❌';
            console.log(`${status} Test ${index + 1}: ${test.testName}`);
            
            if (!test.success) {
                console.log(`   🚨 Error: ${test.result.error}`);
            }
        });

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (successRate >= 90) {
            console.log('   🎉 Excellent! Your webhook integration is working well.');
            console.log('   ✨ Ready for production use with Make.com automation.');
        } else if (successRate >= 70) {
            console.log('   ⚠️  Good, but some improvements needed.');
            console.log('   🔧 Review failed tests and adjust data formatting.');
        } else {
            console.log('   🚨 Issues detected. Review webhook configuration.');
            console.log('   📞 Consider checking GoHighLevel webhook settings.');
        }

        console.log('\n🔧 NEXT STEPS:');
        console.log('   1. Fix any failed tests above');
        console.log('   2. Set up Make.com automation using provided guide'); 
        console.log('   3. Test with real Yelp lead to verify end-to-end flow');
        console.log('   4. Monitor first week of automation closely');

        // Save results to file
        await this.saveResultsToFile();
    }

    /**
     * Save test results to JSON file
     */
    async saveResultsToFile() {
        const fs = await import('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `yelp-webhook-test-results-${timestamp}.json`;
        
        const reportData = {
            timestamp: new Date().toISOString(),
            webhook_url: this.ghlWebhook.webhookUrl,
            total_tests: this.testResults.length,
            successful_tests: this.testResults.filter(r => r.success).length,
            success_rate: ((this.testResults.filter(r => r.success).length / this.testResults.length) * 100).toFixed(1),
            test_results: this.testResults
        };

        try {
            fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
            console.log(`\n💾 Test results saved to: ${filename}`);
        } catch (error) {
            console.log(`\n❌ Could not save results: ${error.message}`);
        }
    }

    /**
     * Test webhook URL accessibility
     */
    async testWebhookAccessibility() {
        console.log('\n🌐 Testing Webhook Accessibility...');
        
        try {
            const response = await fetch(this.ghlWebhook.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ test: true })
            });

            console.log(`📡 Webhook Response Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log('✅ Webhook is accessible and responding');
            } else {
                console.log(`⚠️ Webhook returned status ${response.status}`);
            }

        } catch (error) {
            console.log(`❌ Webhook accessibility test failed: ${error.message}`);
        }
    }
}

// Export for use in other modules
export default YelpWebhookTester;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const tester = new YelpWebhookTester();
        
        // Test webhook accessibility first
        await tester.testWebhookAccessibility();
        
        // Run all tests
        await tester.runAllTests();
        
        console.log('\n🏁 Testing complete!');
    })();
}