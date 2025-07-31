#!/usr/bin/env node

/**
 * Test GoHighLevel Webhook Connection
 * Quick test to verify the webhook URL is working
 */

import { GoHighLevelWebhook } from './gohighlevel-webhook-integration.js';

async function testGoHighLevelConnection() {
    console.log('🧪 Testing GoHighLevel Webhook Connection\n');
    
    const ghlWebhook = new GoHighLevelWebhook();
    
    console.log(`📡 Webhook URL: ${ghlWebhook.webhookUrl}\n`);
    
    // Test data
    const testLead = {
        firstName: 'Test',
        lastName: 'Lead',
        email: 'test@bigtrussroofcleaning.com',
        phone: '(555) 123-4567',
        address: '123 Test Street',
        city: 'Vancouver',
        state: 'BC',
        postalCode: 'V1A 1A1',
        propertyType: 'residential',
        serviceType: 'estimate',
        roofType: 'asphalt',
        urgency: 'normal',
        notes: 'This is a test lead from the inbound webhook system',
        source: 'webhook-test',
        tags: ['test-lead', 'webhook-integration'],
        submissionTime: new Date().toISOString()
    };
    
    console.log('📋 Test Lead Data:');
    console.log(JSON.stringify(testLead, null, 2));
    console.log('\n🚀 Sending to GoHighLevel...\n');
    
    try {
        const result = await ghlWebhook.sendWebhook(testLead);
        
        if (result.success) {
            console.log('✅ SUCCESS! Webhook sent successfully');
            console.log(`📊 Status: ${result.status}`);
            console.log(`⏱️ Timestamp: ${result.timestamp}`);
            
            if (result.data && Object.keys(result.data).length > 0) {
                console.log('📝 Response Data:');
                console.log(JSON.stringify(result.data, null, 2));
            }
            
            console.log('\n🎉 Your GoHighLevel webhook is working correctly!');
            console.log('   The test lead should now appear in your GoHighLevel dashboard.');
            
        } else {
            console.log('❌ FAILED! Webhook request failed');
            console.log(`🚨 Error: ${result.error}`);
            console.log(`⏱️ Timestamp: ${result.timestamp}`);
            
            console.log('\n🔍 Troubleshooting Tips:');
            console.log('1. Verify the webhook URL is correct in GoHighLevel');
            console.log('2. Check that the webhook is active in your GHL account');
            console.log('3. Ensure your GHL account has proper permissions');
            console.log('4. Try creating a new webhook URL in GoHighLevel');
        }
        
    } catch (error) {
        console.log('💥 ERROR! Failed to test webhook');
        console.log(`🚨 Error: ${error.message}`);
        
        if (error.stack) {
            console.log('\n📋 Stack Trace:');
            console.log(error.stack);
        }
        
        console.log('\n🔍 Troubleshooting Tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify the webhook URL format');
        console.log('3. Ensure GoHighLevel services are accessible');
        console.log('4. Check for any firewall/proxy issues');
    }
}

// Additional test with minimal data
async function testMinimalLead() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 Testing with Minimal Lead Data\n');
    
    const ghlWebhook = new GoHighLevelWebhook();
    
    const minimalLead = {
        firstName: 'Minimal',
        lastName: 'Test',
        email: 'minimal@test.com',
        phone: '555-999-0000',
        source: 'webhook-minimal-test'
    };
    
    console.log('📋 Minimal Lead Data:');
    console.log(JSON.stringify(minimalLead, null, 2));
    console.log('\n🚀 Sending to GoHighLevel...\n');
    
    try {
        const result = await ghlWebhook.sendWebhook(minimalLead);
        
        if (result.success) {
            console.log('✅ SUCCESS! Minimal webhook sent successfully');
            console.log('   This confirms basic connectivity is working');
        } else {
            console.log('❌ FAILED! Minimal webhook failed');
            console.log(`🚨 Error: ${result.error}`);
        }
        
    } catch (error) {
        console.log('💥 ERROR! Minimal webhook test failed');
        console.log(`🚨 Error: ${error.message}`);
    }
}

// Run the tests
async function runAllTests() {
    console.log('🎯 GoHighLevel Webhook Connection Test');
    console.log('=' .repeat(60));
    
    await testGoHighLevelConnection();
    await testMinimalLead();
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. If tests passed: Your webhook is ready for production use!');
    console.log('2. If tests failed: Check the troubleshooting tips above');
    console.log('3. Start your inbound webhook server: npm run webhook');
    console.log('4. Test the full flow: npm run webhook:test');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { testGoHighLevelConnection, testMinimalLead };