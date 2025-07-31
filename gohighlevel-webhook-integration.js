/**
 * GoHighLevel Webhook Integration Suite
 * Complete webhook handling, testing, and data mapping utilities
 */

class GoHighLevelWebhook {
    constructor() {
        this.webhookUrl = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';
        this.apiTimeout = 10000; // 10 seconds
    }

    /**
     * Send data to GoHighLevel webhook
     * @param {Object} data - Data to send
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Response from webhook
     */
    async sendWebhook(data, options = {}) {
        try {
            const payload = this.mapData(data, options.mapping);
            
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'BigTruss-Roofing-Integration/1.0',
                    ...options.headers
                },
                body: JSON.stringify(payload),
                timeout: this.apiTimeout
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json().catch(() => ({}));
            
            return {
                success: true,
                status: response.status,
                data: result,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Map and format data for GoHighLevel
     * @param {Object} data - Raw data
     * @param {Object} customMapping - Custom field mapping
     * @returns {Object} Formatted data
     */
    mapData(data, customMapping = {}) {
        const defaultMapping = {
            // Contact Information
            firstName: data.firstName || data.first_name || data.fname || '',
            lastName: data.lastName || data.last_name || data.lname || '',
            email: data.email || data.emailAddress || '',
            phone: data.phone || data.phoneNumber || data.mobile || '',
            
            // Address Information
            address: data.address || data.street || '',
            city: data.city || '',
            state: data.state || data.province || '',
            postalCode: data.postalCode || data.zipCode || data.zip || '',
            country: data.country || 'US',
            
            // Roofing-Specific Fields
            propertyType: data.propertyType || data.property_type || 'residential',
            roofType: data.roofType || data.roof_type || '',
            roofAge: data.roofAge || data.roof_age || '',
            roofSize: data.roofSize || data.roof_size || '',
            roofCondition: data.roofCondition || data.roof_condition || '',
            
            // Service Information
            serviceType: data.serviceType || data.service_type || 'estimate',
            urgency: data.urgency || 'normal',
            preferredContactTime: data.preferredContactTime || data.contact_time || 'anytime',
            
            // Marketing Attribution
            source: data.source || data.utm_source || 'website',
            medium: data.medium || data.utm_medium || 'organic',
            campaign: data.campaign || data.utm_campaign || '',
            
            // Additional Fields
            notes: data.notes || data.message || data.comments || '',
            tags: data.tags || ['website-lead'],
            customFields: data.customFields || {}
        };

        // Apply custom mapping overrides
        const mapping = { ...defaultMapping, ...customMapping };
        
        // Clean and validate data
        return this.validateAndClean(mapping);
    }

    /**
     * Validate and clean mapped data
     * @param {Object} data - Mapped data
     * @returns {Object} Cleaned data
     */
    validateAndClean(data) {
        const cleaned = {};
        
        // Clean strings
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
                cleaned[key] = data[key].trim();
            } else {
                cleaned[key] = data[key];
            }
        });

        // Validate email format
        if (cleaned.email && !this.isValidEmail(cleaned.email)) {
            cleaned.email = '';
        }

        // Format phone number
        if (cleaned.phone) {
            cleaned.phone = this.formatPhoneNumber(cleaned.phone);
        }

        // Ensure required arrays
        if (!Array.isArray(cleaned.tags)) {
            cleaned.tags = cleaned.tags ? [cleaned.tags] : ['website-lead'];
        }

        return cleaned;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Format phone number to standard format
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        return phone; // Return original if can't format
    }

    /**
     * Test webhook with sample data
     * @returns {Promise<Object>} Test result
     */
    async testWebhook() {
        const testData = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '555-123-4567',
            address: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            propertyType: 'residential',
            serviceType: 'roof-inspection',
            notes: 'Test webhook submission from BigTruss Roofing integration',
            source: 'website-test',
            tags: ['test-lead', 'website']
        };

        console.log('Testing webhook with sample data...');
        const result = await this.sendWebhook(testData);
        
        if (result.success) {
            console.log('✅ Webhook test successful!', result);
        } else {
            console.error('❌ Webhook test failed:', result.error);
        }
        
        return result;
    }

    /**
     * Process form submission data
     * @param {FormData|Object} formData - Form data to process
     * @returns {Promise<Object>} Submission result
     */
    async processFormSubmission(formData) {
        let data = {};
        
        if (formData instanceof FormData) {
            // Convert FormData to Object
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
        } else {
            data = formData;
        }

        // Add timestamp and session info
        data.submissionTime = new Date().toISOString();
        data.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server';
        data.source = data.source || 'website-form';

        return await this.sendWebhook(data);
    }

    /**
     * Batch process multiple leads
     * @param {Array} leads - Array of lead data
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} Results for each lead
     */
    async batchProcess(leads, options = {}) {
        const results = [];
        const delay = options.delay || 1000; // 1 second delay between requests
        
        for (let i = 0; i < leads.length; i++) {
            const lead = leads[i];
            console.log(`Processing lead ${i + 1}/${leads.length}...`);
            
            const result = await this.sendWebhook(lead);
            results.push({
                index: i,
                leadData: lead,
                result: result
            });
            
            // Delay between requests to avoid rate limiting
            if (i < leads.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return results;
    }

    /**
     * Get webhook status and health check
     * @returns {Object} Webhook status information
     */
    getWebhookInfo() {
        return {
            webhookUrl: this.webhookUrl,
            timeout: this.apiTimeout,
            status: 'active',
            lastTest: null,
            supportedMethods: ['POST'],
            expectedContentType: 'application/json'
        };
    }
}

// ES module export (default)
export default GoHighLevelWebhook;

// Named export for compatibility
export { GoHighLevelWebhook };

// Export for Node.js environments (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoHighLevelWebhook;
}

// Global instance for browser environments
if (typeof window !== 'undefined') {
    window.GoHighLevelWebhook = GoHighLevelWebhook;
}