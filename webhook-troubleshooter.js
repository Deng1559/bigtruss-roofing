/**
 * GoHighLevel Webhook API Error Troubleshooter
 * Comprehensive error diagnosis and resolution system
 */

class WebhookTroubleshooter {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl || 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/371aba6b-c045-4da8-aa66-4e4bc443b135';
        this.commonErrors = this.getCommonErrors();
        this.diagnosticTests = this.getDiagnosticTests();
    }

    /**
     * Common webhook API errors and solutions
     */
    getCommonErrors() {
        return {
            // Network & Connectivity Errors
            'NETWORK_ERROR': {
                description: 'Network connectivity issues',
                causes: ['Internet connection problems', 'DNS resolution failure', 'Firewall blocking'],
                solutions: [
                    'Check internet connection',
                    'Try from different network',
                    'Check firewall settings',
                    'Verify DNS resolution'
                ]
            },
            
            'CORS_ERROR': {
                description: 'Cross-Origin Resource Sharing blocked',
                causes: ['Browser CORS policy', 'Missing CORS headers', 'Invalid origin'],
                solutions: [
                    'Use server-side request instead of browser',
                    'Add proper CORS headers',
                    'Use JSONP or proxy server',
                    'Test from same origin'
                ]
            },

            // HTTP Status Errors
            '400_BAD_REQUEST': {
                description: 'Invalid request format or data',
                causes: ['Invalid JSON payload', 'Missing required fields', 'Invalid field format'],
                solutions: [
                    'Validate JSON syntax',
                    'Check required fields',
                    'Verify field formats',
                    'Review API documentation'
                ]
            },

            '401_UNAUTHORIZED': {
                description: 'Authentication failed',
                causes: ['Invalid API key', 'Missing authentication', 'Expired token'],
                solutions: [
                    'Check API key/token',
                    'Verify authentication headers',
                    'Refresh expired tokens',
                    'Contact GoHighLevel support'
                ]
            },

            '403_FORBIDDEN': {
                description: 'Access forbidden',
                causes: ['Insufficient permissions', 'Rate limiting', 'IP restrictions'],
                solutions: [
                    'Check account permissions',
                    'Reduce request frequency',
                    'Verify IP whitelist',
                    'Contact administrator'
                ]
            },

            '404_NOT_FOUND': {
                description: 'Webhook endpoint not found',
                causes: ['Invalid webhook URL', 'Webhook deleted', 'Wrong subdomain'],
                solutions: [
                    'Verify webhook URL',
                    'Check webhook configuration in GHL',
                    'Regenerate webhook URL',
                    'Contact support'
                ]
            },

            '422_UNPROCESSABLE': {
                description: 'Data validation failed',
                causes: ['Invalid field values', 'Data type mismatch', 'Business rule violation'],
                solutions: [
                    'Check field validation rules',
                    'Verify data types',
                    'Review business constraints',
                    'Test with minimal payload'
                ]
            },

            '429_RATE_LIMITED': {
                description: 'Too many requests',
                causes: ['Exceeded rate limits', 'Burst request patterns', 'Concurrent requests'],
                solutions: [
                    'Implement request throttling',
                    'Add delays between requests',
                    'Use exponential backoff',
                    'Reduce request frequency'
                ]
            },

            '500_SERVER_ERROR': {
                description: 'GoHighLevel server error',
                causes: ['Server maintenance', 'Internal server error', 'Database issues'],
                solutions: [
                    'Retry after delay',
                    'Check GoHighLevel status page',
                    'Contact support if persistent',
                    'Implement retry logic'
                ]
            },

            '502_BAD_GATEWAY': {
                description: 'Gateway error',
                causes: ['Load balancer issues', 'Upstream server problems', 'Network infrastructure'],
                solutions: [
                    'Retry request',
                    'Check service status',
                    'Wait for infrastructure recovery',
                    'Use alternative endpoint if available'
                ]
            },

            '503_SERVICE_UNAVAILABLE': {
                description: 'Service temporarily unavailable',
                causes: ['Scheduled maintenance', 'Server overload', 'Deployment in progress'],
                solutions: [
                    'Wait and retry',
                    'Check maintenance announcements',
                    'Implement exponential backoff',
                    'Queue requests for later'
                ]
            },

            '504_TIMEOUT': {
                description: 'Request timeout',
                causes: ['Slow network', 'Server processing delay', 'Large payload'],
                solutions: [
                    'Increase timeout duration',
                    'Reduce payload size',
                    'Split large requests',
                    'Check network speed'
                ]
            },

            // Payload & Format Errors
            'INVALID_JSON': {
                description: 'JSON parsing failed',
                causes: ['Malformed JSON', 'Encoding issues', 'Special characters'],
                solutions: [
                    'Validate JSON syntax',
                    'Check character encoding',
                    'Escape special characters',
                    'Use JSON validator'
                ]
            },

            'MISSING_CONTENT_TYPE': {
                description: 'Missing or incorrect Content-Type header',
                causes: ['No Content-Type header', 'Wrong MIME type', 'Charset issues'],
                solutions: [
                    'Set Content-Type: application/json',
                    'Include charset=utf-8',
                    'Verify header case sensitivity',
                    'Check framework defaults'
                ]
            },

            'FIELD_VALIDATION': {
                description: 'Field validation errors',
                causes: ['Invalid email format', 'Phone number format', 'Required fields missing'],
                solutions: [
                    'Implement client-side validation',
                    'Use proper field formats',
                    'Check required field list',
                    'Sanitize input data'
                ]
            }
        };
    }

    /**
     * Diagnostic test suite
     */
    getDiagnosticTests() {
        return [
            {
                name: 'connectivity',
                description: 'Test basic connectivity to webhook endpoint',
                test: this.testConnectivity.bind(this)
            },
            {
                name: 'minimal_payload',
                description: 'Test with minimal valid payload',
                test: this.testMinimalPayload.bind(this)
            },
            {
                name: 'field_validation',
                description: 'Test field validation requirements',
                test: this.testFieldValidation.bind(this)
            },
            {
                name: 'payload_size',
                description: 'Test payload size limits',
                test: this.testPayloadSize.bind(this)
            },
            {
                name: 'rate_limiting',
                description: 'Test rate limiting behavior',
                test: this.testRateLimiting.bind(this)
            },
            {
                name: 'content_types',
                description: 'Test different content types',
                test: this.testContentTypes.bind(this)
            }
        ];
    }

    /**
     * Run comprehensive webhook diagnostics
     */
    async runDiagnostics() {
        console.log('🔍 Starting webhook diagnostics...\n');
        
        const results = {
            timestamp: new Date().toISOString(),
            webhookUrl: this.webhookUrl,
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };

        for (const test of this.diagnosticTests) {
            console.log(`Running ${test.name} test...`);
            
            try {
                const testResult = await test.test();
                testResult.name = test.name;
                testResult.description = test.description;
                
                results.tests.push(testResult);
                results.summary.total++;
                
                if (testResult.status === 'pass') {
                    results.summary.passed++;
                    console.log(`✅ ${test.name}: PASSED`);
                } else if (testResult.status === 'fail') {
                    results.summary.failed++;
                    console.log(`❌ ${test.name}: FAILED`);
                } else {
                    results.summary.warnings++;
                    console.log(`⚠️ ${test.name}: WARNING`);
                }
                
                if (testResult.details) {
                    console.log(`   ${testResult.details}`);
                }
                
            } catch (error) {
                results.tests.push({
                    name: test.name,
                    description: test.description,
                    status: 'error',
                    error: error.message
                });
                results.summary.failed++;
                console.log(`💥 ${test.name}: ERROR - ${error.message}`);
            }
            
            console.log('');
            
            // Add delay between tests to avoid rate limiting
            await this.delay(1000);
        }

        // Generate recommendations
        results.recommendations = this.generateRecommendations(results);
        
        console.log('📊 Diagnostics Summary:');
        console.log(`   Total Tests: ${results.summary.total}`);
        console.log(`   Passed: ${results.summary.passed}`);
        console.log(`   Failed: ${results.summary.failed}`);
        console.log(`   Warnings: ${results.summary.warnings}`);
        
        return results;
    }

    /**
     * Test basic connectivity
     */
    async testConnectivity() {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'HEAD',
                timeout: 5000
            });
            
            return {
                status: response.ok ? 'pass' : 'fail',
                details: `HTTP ${response.status} ${response.statusText}`,
                httpStatus: response.status
            };
        } catch (error) {
            return {
                status: 'fail',
                details: `Connection failed: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Test minimal payload
     */
    async testMinimalPayload() {
        const minimalPayload = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '555-123-4567'
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(minimalPayload),
                timeout: 10000
            });

            const responseText = await response.text().catch(() => '');
            
            return {
                status: response.ok ? 'pass' : 'fail',
                details: `HTTP ${response.status} - ${responseText.substring(0, 100)}`,
                httpStatus: response.status,
                responseSize: responseText.length
            };
        } catch (error) {
            return {
                status: 'fail',
                details: `Request failed: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Test field validation
     */
    async testFieldValidation() {
        const invalidPayloads = [
            { test: 'invalid_email', firstName: 'Test', email: 'invalid-email' },
            { test: 'missing_required', notes: 'Only optional fields' },
            { test: 'invalid_phone', firstName: 'Test', phone: 'not-a-phone' }
        ];

        const results = [];
        
        for (const payload of invalidPayloads) {
            try {
                const response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    timeout: 5000
                });

                results.push({
                    test: payload.test,
                    status: response.status,
                    expected: 'validation error',
                    actual: response.ok ? 'accepted' : 'rejected'
                });
            } catch (error) {
                results.push({
                    test: payload.test,
                    error: error.message
                });
            }
            
            await this.delay(500);
        }

        return {
            status: 'pass', // This test provides information rather than pass/fail
            details: `Tested ${results.length} validation scenarios`,
            results: results
        };
    }

    /**
     * Test payload size limits
     */
    async testPayloadSize() {
        const sizes = [1, 10, 100]; // KB
        const results = [];

        for (const sizeKB of sizes) {
            const largeString = 'x'.repeat(sizeKB * 1024);
            const payload = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                notes: largeString
            };

            try {
                const response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    timeout: 15000
                });

                results.push({
                    sizeKB: sizeKB,
                    status: response.status,
                    success: response.ok
                });
            } catch (error) {
                results.push({
                    sizeKB: sizeKB,
                    error: error.message
                });
            }
            
            await this.delay(1000);
        }

        const maxSuccessfulSize = Math.max(...results.filter(r => r.success).map(r => r.sizeKB));
        
        return {
            status: maxSuccessfulSize > 0 ? 'pass' : 'fail',
            details: `Max successful payload: ${maxSuccessfulSize}KB`,
            results: results
        };
    }

    /**
     * Test rate limiting
     */
    async testRateLimiting() {
        const requests = 5;
        const interval = 100; // ms
        const results = [];

        const payload = {
            firstName: 'Rate',
            lastName: 'Test',
            email: 'ratetest@example.com'
        };

        for (let i = 0; i < requests; i++) {
            const startTime = Date.now();
            
            try {
                const response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, sequence: i }),
                    timeout: 5000
                });

                results.push({
                    sequence: i,
                    status: response.status,
                    duration: Date.now() - startTime,
                    rateLimited: response.status === 429
                });
            } catch (error) {
                results.push({
                    sequence: i,
                    error: error.message,
                    duration: Date.now() - startTime
                });
            }
            
            if (i < requests - 1) {
                await this.delay(interval);
            }
        }

        const rateLimitedCount = results.filter(r => r.rateLimited).length;
        
        return {
            status: rateLimitedCount === 0 ? 'pass' : 'warning',
            details: `${rateLimitedCount}/${requests} requests rate limited`,
            results: results
        };
    }

    /**
     * Test different content types
     */
    async testContentTypes() {
        const contentTypes = [
            { type: 'application/json', valid: true },
            { type: 'application/json; charset=utf-8', valid: true },
            { type: 'text/plain', valid: false },
            { type: 'application/x-www-form-urlencoded', valid: false }
        ];

        const payload = { firstName: 'Content', lastName: 'Test', email: 'content@example.com' };
        const results = [];

        for (const ct of contentTypes) {
            try {
                const body = ct.type.includes('json') 
                    ? JSON.stringify(payload)
                    : new URLSearchParams(payload).toString();

                const response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': ct.type },
                    body: body,
                    timeout: 5000
                });

                results.push({
                    contentType: ct.type,
                    expected: ct.valid,
                    status: response.status,
                    accepted: response.ok
                });
            } catch (error) {
                results.push({
                    contentType: ct.type,
                    error: error.message
                });
            }
            
            await this.delay(500);
        }

        return {
            status: 'pass',
            details: `Tested ${results.length} content types`,
            results: results
        };
    }

    /**
     * Analyze error and provide solutions
     */
    analyzeError(error, response = null) {
        const analysis = {
            errorType: 'UNKNOWN_ERROR',
            description: 'Unknown error occurred',
            causes: [],
            solutions: [],
            severity: 'medium'
        };

        // Network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            analysis.errorType = 'NETWORK_ERROR';
        } else if (error.message.includes('CORS')) {
            analysis.errorType = 'CORS_ERROR';
        }

        // HTTP status errors
        if (response) {
            const statusKey = `${response.status}_${this.getStatusText(response.status)}`;
            if (this.commonErrors[statusKey]) {
                analysis.errorType = statusKey;
            }
        }

        // JSON errors
        if (error.message.includes('JSON') || error.message.includes('parse')) {
            analysis.errorType = 'INVALID_JSON';
        }

        // Apply error details
        if (this.commonErrors[analysis.errorType]) {
            const errorInfo = this.commonErrors[analysis.errorType];
            analysis.description = errorInfo.description;
            analysis.causes = errorInfo.causes;
            analysis.solutions = errorInfo.solutions;
        }

        // Set severity
        if (analysis.errorType.includes('500') || analysis.errorType.includes('502') || analysis.errorType.includes('503')) {
            analysis.severity = 'high';
        } else if (analysis.errorType.includes('400') || analysis.errorType.includes('422')) {
            analysis.severity = 'medium';
        } else {
            analysis.severity = 'low';
        }

        return analysis;
    }

    /**
     * Generate recommendations based on diagnostic results
     */
    generateRecommendations(diagnosticResults) {
        const recommendations = [];
        
        // Check for failed tests
        const failedTests = diagnosticResults.tests.filter(t => t.status === 'fail');
        
        if (failedTests.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'critical_fixes',
                title: 'Fix Critical Issues',
                items: failedTests.map(t => `Address ${t.name} failure: ${t.details}`)
            });
        }

        // Check for warnings
        const warningTests = diagnosticResults.tests.filter(t => t.status === 'warning');
        
        if (warningTests.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'improvements',
                title: 'Performance Improvements',
                items: warningTests.map(t => `Review ${t.name}: ${t.details}`)
            });
        }

        // General best practices
        recommendations.push({
            priority: 'low',
            category: 'best_practices',
            title: 'Best Practices',
            items: [
                'Implement exponential backoff for retries',
                'Add comprehensive error logging',
                'Monitor webhook success rates',
                'Validate data before sending',
                'Use HTTPS for all requests'
            ]
        });

        return recommendations;
    }

    /**
     * Get HTTP status text
     */
    getStatusText(status) {
        const statusTexts = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            422: 'UNPROCESSABLE',
            429: 'RATE_LIMITED',
            500: 'SERVER_ERROR',
            502: 'BAD_GATEWAY',
            503: 'SERVICE_UNAVAILABLE',
            504: 'TIMEOUT'
        };
        
        return statusTexts[status] || 'UNKNOWN_STATUS';
    }

    /**
     * Utility: Add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Quick error fix suggestions
     */
    getQuickFixes(errorType) {
        const quickFixes = {
            'CORS_ERROR': [
                'Switch to server-side request',
                'Use a CORS proxy service',
                'Test from same domain'
            ],
            '400_BAD_REQUEST': [
                'Validate JSON payload',
                'Check required fields',
                'Test with minimal data'
            ],
            '404_NOT_FOUND': [
                'Verify webhook URL',
                'Check GoHighLevel settings',
                'Regenerate webhook'
            ],
            '429_RATE_LIMITED': [
                'Add delays between requests',
                'Implement exponential backoff',
                'Reduce request frequency'
            ]
        };

        return quickFixes[errorType] || ['Contact support', 'Check documentation', 'Retry request'];
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebhookTroubleshooter;
}

// Global instance for browser environments
if (typeof window !== 'undefined') {
    window.WebhookTroubleshooter = WebhookTroubleshooter;
}