#!/usr/bin/env node

/**
 * Comprehensive Webhook Testing Suite
 * Tests the inbound webhook server with various scenarios
 */

import { InboundWebhookServer } from './inbound-webhook-server.js';

class WebhookTester {
    constructor() {
        this.server = null;
        this.testResults = [];
        this.baseUrl = 'http://localhost:3000';
    }

    /**
     * Run all webhook tests
     */
    async runAllTests() {
        console.log('🧪 Starting Webhook Test Suite\n');

        try {
            // Start test server
            await this.startTestServer();

            // Wait for server to be ready
            await this.delay(1000);

            // Run test scenarios
            await this.testHealthEndpoint();
            await this.testMetricsEndpoint();
            await this.testBasicWebhook();
            await this.testValidationErrors();
            await this.testDifferentSources();
            await this.testPayloadFormats();
            await this.testRateLimiting();

            // Print results
            this.printResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        } finally {
            await this.stopTestServer();
        }
    }

    /**
     * Start test server
     */
    async startTestServer() {
        console.log('🚀 Starting test server...');
        
        this.server = new InboundWebhookServer({
            port: 3000,
            enableLogging: false, // Reduce noise during testing
            enableSecurity: true,
            forwardToGHL: false // Don't forward during tests
        });

        await this.server.start();
        console.log('✅ Test server started\n');
    }

    /**
     * Stop test server
     */
    async stopTestServer() {
        if (this.server) {
            console.log('\n🛑 Stopping test server...');
            await this.server.shutdown();
            console.log('✅ Test server stopped');
        }
    }

    /**
     * Test health endpoint
     */
    async testHealthEndpoint() {
        console.log('🏥 Testing health endpoint...');
        
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const data = await response.json();
            
            const success = response.status === 200 && data.status === 'healthy';
            this.addResult('Health Endpoint', success, success ? null : 'Invalid response');
            
        } catch (error) {
            this.addResult('Health Endpoint', false, error.message);
        }
    }

    /**
     * Test metrics endpoint
     */
    async testMetricsEndpoint() {
        console.log('📊 Testing metrics endpoint...');
        
        try {
            const response = await fetch(`${this.baseUrl}/metrics`);
            const data = await response.json();
            
            const success = response.status === 200 && data.server && typeof data.server.totalRequests === 'number';
            this.addResult('Metrics Endpoint', success, success ? null : 'Invalid metrics structure');
            
        } catch (error) {
            this.addResult('Metrics Endpoint', false, error.message);
        }
    }

    /**
     * Test basic webhook functionality
     */
    async testBasicWebhook() {
        console.log('📨 Testing basic webhook...');
        
        const testData = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '555-123-4567',
            serviceType: 'estimate',
            notes: 'Test webhook request'
        };

        try {
            const response = await fetch(`${this.baseUrl}/webhook/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            const data = await response.json();
            const success = response.status === 200 && data.success === true;
            this.addResult('Basic Webhook', success, success ? null : data.message || 'Request failed');
            
        } catch (error) {
            this.addResult('Basic Webhook', false, error.message);
        }
    }

    /**
     * Test validation errors
     */
    async testValidationErrors() {
        console.log('⚠️ Testing validation errors...');
        
        // Test with empty payload
        try {
            const response = await fetch(`${this.baseUrl}/webhook/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            // Should succeed but with warnings due to fallback data mapper
            const success = response.status === 200;
            this.addResult('Empty Payload Validation', success, success ? null : 'Should handle empty payload gracefully');
            
        } catch (error) {
            this.addResult('Empty Payload Validation', false, error.message);
        }

        // Test with malformed JSON
        try {
            const response = await fetch(`${this.baseUrl}/webhook/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: 'invalid json'
            });

            const success = response.status === 400;
            this.addResult('Malformed JSON Handling', success, success ? null : 'Should reject malformed JSON');
            
        } catch (error) {
            this.addResult('Malformed JSON Handling', false, error.message);
        }
    }

    /**
     * Test different webhook sources
     */
    async testDifferentSources() {
        console.log('🎯 Testing different sources...');
        
        const sources = ['yelp', 'facebook', 'google', 'website'];
        const testData = {
            firstName: 'Source',
            lastName: 'Test',
            email: 'source@example.com'
        };

        for (const source of sources) {
            try {
                const response = await fetch(`${this.baseUrl}/webhook/${source}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(testData)
                });

                const data = await response.json();
                const success = response.status === 200 && data.source === source;
                this.addResult(`Source: ${source}`, success, success ? null : 'Source not properly identified');
                
            } catch (error) {
                this.addResult(`Source: ${source}`, false, error.message);
            }

            await this.delay(100); // Small delay between requests
        }
    }

    /**
     * Test different payload formats
     */
    async testPayloadFormats() {
        console.log('📋 Testing payload formats...');
        
        // Test form data
        try {
            const formData = new URLSearchParams();
            formData.append('firstName', 'Form');
            formData.append('lastName', 'Test');
            formData.append('email', 'form@example.com');

            const response = await fetch(`${this.baseUrl}/webhook/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();
            const success = response.status === 200 && data.success === true;
            this.addResult('Form Data Format', success, success ? null : 'Form data not processed correctly');
            
        } catch (error) {
            this.addResult('Form Data Format', false, error.message);
        }

        // Test query parameters
        try {
            const queryParams = new URLSearchParams({
                firstName: 'Query',
                lastName: 'Test',
                email: 'query@example.com'
            });

            const response = await fetch(`${this.baseUrl}/webhook/test?${queryParams}`, {
                method: 'POST'
            });

            const data = await response.json();
            const success = response.status === 200 && data.success === true;
            this.addResult('Query Parameters', success, success ? null : 'Query parameters not processed correctly');
            
        } catch (error) {
            this.addResult('Query Parameters', false, error.message);
        }
    }

    /**
     * Test rate limiting
     */
    async testRateLimiting() {
        console.log('🚦 Testing rate limiting...');
        
        const testData = { test: 'rate-limit' };
        let requests = [];

        // Send many requests quickly
        for (let i = 0; i < 10; i++) {
            requests.push(
                fetch(`${this.baseUrl}/webhook/test`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(testData)
                })
            );
        }

        try {
            const responses = await Promise.all(requests);
            const statusCodes = responses.map(r => r.status);
            
            // Should have mostly 200s with some possible 429s if rate limiting is working
            const success200s = statusCodes.filter(code => code === 200).length;
            const success = success200s >= 5; // Allow some failures due to rate limiting
            
            this.addResult('Rate Limiting', success, success ? null : 'Rate limiting may not be working properly');
            
        } catch (error) {
            this.addResult('Rate Limiting', false, error.message);
        }
    }

    /**
     * Add test result
     */
    addResult(testName, success, error = null) {
        this.testResults.push({
            name: testName,
            success: success,
            error: error,
            timestamp: new Date().toISOString()
        });

        const status = success ? '✅' : '❌';
        const errorMsg = error ? ` (${error})` : '';
        console.log(`   ${status} ${testName}${errorMsg}`);
    }

    /**
     * Print final results
     */
    printResults() {
        console.log('\n📋 Test Results Summary');
        console.log('=' .repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => {
                    console.log(`   - ${r.name}: ${r.error}`);
                });
        }

        console.log('\n🎉 Test suite completed!');
    }

    /**
     * Utility: Add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Manual test functions for specific scenarios
export class ManualWebhookTests {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * Test Yelp-style webhook
     */
    async testYelpWebhook() {
        const yelpData = {
            name: 'Sarah Johnson',
            phone: '(555) 987-6543',
            email: 'sarah.johnson@email.com',
            message: 'Hi, I need roof cleaning services for my 2-story house. The roof is about 15 years old and has some moss growth. When can you provide an estimate?',
            service: 'Roof Cleaning',
            source: 'Yelp',
            location: 'Vancouver, BC',
            propertyType: 'residential',
            urgency: 'normal'
        };

        console.log('🌟 Testing Yelp-style webhook...');
        
        try {
            const response = await fetch(`${this.baseUrl}/webhook/yelp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(yelpData)
            });

            const result = await response.json();
            console.log('Response:', JSON.stringify(result, null, 2));
            return result;

        } catch (error) {
            console.error('Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test website form webhook
     */
    async testWebsiteForm() {
        const formData = {
            firstName: 'Mike',
            lastName: 'Thompson',
            email: 'mike.thompson@example.com',
            phone: '555-234-5678',
            address: '456 Oak Street',
            city: 'Portland',
            state: 'Oregon',
            postalCode: '97201',
            serviceType: 'estimate',
            roofType: 'asphalt',
            roofAge: '6-10',
            notes: 'Looking for a quote on roof replacement. House is about 2000 sq ft.',
            source: 'website',
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'roof-replacement'
        };

        console.log('🌐 Testing website form webhook...');
        
        try {
            const response = await fetch(`${this.baseUrl}/webhook/website`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Response:', JSON.stringify(result, null, 2));
            return result;

        } catch (error) {
            console.error('Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test Facebook lead ad webhook
     */
    async testFacebookLead() {
        const facebookData = {
            name: 'Jennifer Davis',
            phone: '+1-555-345-6789',
            email: 'jennifer.davis@gmail.com',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            service_type: 'inspection',
            property_type: 'residential',
            message: 'Interested in roof inspection after recent storm',
            source: 'facebook',
            campaign_name: 'Storm Damage Roof Inspection',
            ad_set_name: 'Seattle Metro',
            lead_id: 'fb_lead_12345'
        };

        console.log('📘 Testing Facebook lead webhook...');
        
        try {
            const response = await fetch(`${this.baseUrl}/webhook/facebook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facebookData)
            });

            const result = await response.json();
            console.log('Response:', JSON.stringify(result, null, 2));
            return result;

        } catch (error) {
            console.error('Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    
    if (command === 'full') {
        // Run full test suite
        const tester = new WebhookTester();
        await tester.runAllTests();
        
    } else if (command === 'manual') {
        // Run manual tests (assumes server is already running)
        const manualTests = new ManualWebhookTests();
        console.log('🧪 Running manual tests (server should be running on port 3000)...\n');
        
        await manualTests.testYelpWebhook();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await manualTests.testWebsiteForm();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await manualTests.testFacebookLead();
        
        console.log('\n✅ Manual tests completed!');
        
    } else {
        console.log('Usage:');
        console.log('  node webhook-test.js full    - Run full automated test suite');
        console.log('  node webhook-test.js manual  - Run manual tests (server must be running)');
        console.log('\nOr start the server first with: npm run webhook');
    }
}

export { WebhookTester, ManualWebhookTests };