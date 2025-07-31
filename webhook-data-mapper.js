/**
 * Advanced Data Mapping System for GoHighLevel Webhook Integration
 * Handles complex field transformations, validation, and custom mapping rules
 */

class WebhookDataMapper {
    constructor() {
        this.mappingRules = this.getDefaultMappingRules();
        this.validationRules = this.getValidationRules();
        this.transformationRules = this.getTransformationRules();
    }

    /**
     * Get default field mapping rules
     * @returns {Object} Default mapping configuration
     */
    getDefaultMappingRules() {
        return {
            // Contact Information
            contact: {
                firstName: {
                    sources: ['firstName', 'first_name', 'fname', 'given_name'],
                    required: true,
                    type: 'string',
                    maxLength: 50
                },
                lastName: {
                    sources: ['lastName', 'last_name', 'lname', 'family_name', 'surname'],
                    required: true,
                    type: 'string',
                    maxLength: 50
                },
                email: {
                    sources: ['email', 'emailAddress', 'email_address', 'mail'],
                    required: true,
                    type: 'email',
                    validation: 'email'
                },
                phone: {
                    sources: ['phone', 'phoneNumber', 'phone_number', 'mobile', 'cell', 'telephone'],
                    required: true,
                    type: 'phone',
                    validation: 'phone'
                }
            },
            
            // Address Information
            address: {
                address: {
                    sources: ['address', 'street', 'street_address', 'address1', 'property_address'],
                    required: false,
                    type: 'string',
                    maxLength: 200
                },
                address2: {
                    sources: ['address2', 'apt', 'apartment', 'unit', 'suite'],
                    required: false,
                    type: 'string',
                    maxLength: 100
                },
                city: {
                    sources: ['city', 'locality', 'town'],
                    required: false,
                    type: 'string',
                    maxLength: 50
                },
                state: {
                    sources: ['state', 'province', 'region', 'state_province'],
                    required: false,
                    type: 'string',
                    maxLength: 50,
                    transformation: 'stateCode'
                },
                postalCode: {
                    sources: ['postalCode', 'zipCode', 'zip', 'postal_code', 'zip_code'],
                    required: false,
                    type: 'string',
                    validation: 'postalCode'
                },
                country: {
                    sources: ['country', 'country_code'],
                    required: false,
                    type: 'string',
                    default: 'US',
                    transformation: 'countryCode'
                }
            },
            
            // Roofing-Specific Fields
            roofing: {
                propertyType: {
                    sources: ['propertyType', 'property_type', 'building_type'],
                    required: false,
                    type: 'select',
                    options: ['residential', 'commercial', 'industrial', 'multi-family'],
                    default: 'residential'
                },
                roofType: {
                    sources: ['roofType', 'roof_type', 'roofing_type'],
                    required: false,
                    type: 'select',
                    options: ['asphalt', 'metal', 'tile', 'slate', 'wood', 'flat', 'other']
                },
                roofAge: {
                    sources: ['roofAge', 'roof_age', 'age_of_roof'],
                    required: false,
                    type: 'select',
                    options: ['0-5', '6-10', '11-15', '16-20', '21-30', '30+', 'unknown']
                },
                roofSize: {
                    sources: ['roofSize', 'roof_size', 'square_footage'],
                    required: false,
                    type: 'string',
                    validation: 'roofSize'
                },
                roofCondition: {
                    sources: ['roofCondition', 'roof_condition', 'condition'],
                    required: false,
                    type: 'select',
                    options: ['excellent', 'good', 'fair', 'poor', 'needs_replacement']
                }
            },
            
            // Service Information
            service: {
                serviceType: {
                    sources: ['serviceType', 'service_type', 'service_needed', 'request_type'],
                    required: false,
                    type: 'select',
                    options: ['estimate', 'repair', 'replacement', 'inspection', 'maintenance', 'emergency', 'consultation'],
                    default: 'estimate'
                },
                urgency: {
                    sources: ['urgency', 'priority', 'timeline'],
                    required: false,
                    type: 'select',
                    options: ['emergency', 'urgent', 'normal', 'flexible'],
                    default: 'normal'
                },
                preferredContactTime: {
                    sources: ['preferredContactTime', 'contact_time', 'best_time_to_call'],
                    required: false,
                    type: 'select',
                    options: ['morning', 'afternoon', 'evening', 'anytime'],
                    default: 'anytime'
                },
                budget: {
                    sources: ['budget', 'estimated_budget', 'price_range'],
                    required: false,
                    type: 'select',
                    options: ['under_5k', '5k_10k', '10k_20k', '20k_50k', 'over_50k', 'not_sure']
                }
            },
            
            // Marketing Attribution
            attribution: {
                source: {
                    sources: ['source', 'utm_source', 'lead_source', 'referral_source'],
                    required: false,
                    type: 'string',
                    default: 'website'
                },
                medium: {
                    sources: ['medium', 'utm_medium', 'marketing_medium'],
                    required: false,
                    type: 'string',
                    default: 'organic'
                },
                campaign: {
                    sources: ['campaign', 'utm_campaign', 'campaign_name'],
                    required: false,
                    type: 'string'
                },
                term: {
                    sources: ['term', 'utm_term', 'keyword'],
                    required: false,
                    type: 'string'
                },
                content: {
                    sources: ['content', 'utm_content', 'ad_content'],
                    required: false,
                    type: 'string'
                }
            },
            
            // Additional Fields
            additional: {
                notes: {
                    sources: ['notes', 'message', 'comments', 'description', 'details'],
                    required: false,
                    type: 'text',
                    maxLength: 2000
                },
                tags: {
                    sources: ['tags', 'categories', 'labels'],
                    required: false,
                    type: 'array',
                    default: ['website-lead']
                },
                customFields: {
                    sources: ['customFields', 'custom_fields', 'additional_data'],
                    required: false,
                    type: 'object'
                },
                leadScore: {
                    sources: ['leadScore', 'lead_score', 'score'],
                    required: false,
                    type: 'number',
                    min: 0,
                    max: 100
                }
            }
        };
    }

    /**
     * Get validation rules
     * @returns {Object} Validation rules
     */
    getValidationRules() {
        return {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
            },
            phone: {
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Invalid phone number format',
                transform: this.formatPhoneNumber.bind(this)
            },
            postalCode: {
                us: /^\d{5}(-\d{4})?$/,
                ca: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
                message: 'Invalid postal code format'
            },
            roofSize: {
                pattern: /^\d+(\.\d+)?\s*(sq\s?ft|square\s?feet|sqft|sf)?$/i,
                message: 'Invalid roof size format (e.g., "2500 sq ft")'
            }
        };
    }

    /**
     * Get transformation rules
     * @returns {Object} Transformation rules
     */
    getTransformationRules() {
        return {
            stateCode: {
                'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
                'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
                'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
                'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
                'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
                'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
                'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
                'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
                'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
                'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
                'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
                'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
                'wisconsin': 'WI', 'wyoming': 'WY'
            },
            countryCode: {
                'united states': 'US', 'canada': 'CA', 'mexico': 'MX',
                'united kingdom': 'GB', 'australia': 'AU'
            }
        };
    }

    /**
     * Map raw data to GoHighLevel format
     * @param {Object} rawData - Raw input data
     * @param {Object} customMapping - Custom mapping overrides
     * @returns {Object} Mapped and validated data
     */
    mapData(rawData, customMapping = {}) {
        const mappedData = {};
        const errors = [];
        const warnings = [];

        // Apply custom mapping overrides
        const mappingRules = this.mergeDeep(this.mappingRules, customMapping);

        // Process each category
        Object.keys(mappingRules).forEach(category => {
            Object.keys(mappingRules[category]).forEach(field => {
                const rule = mappingRules[category][field];
                const value = this.extractValue(rawData, rule.sources);

                if (value !== null && value !== undefined && value !== '') {
                    const processedValue = this.processValue(value, rule, field);
                    
                    if (processedValue.isValid) {
                        mappedData[field] = processedValue.value;
                        
                        if (processedValue.warnings) {
                            warnings.push(...processedValue.warnings);
                        }
                    } else {
                        errors.push({
                            field: field,
                            value: value,
                            errors: processedValue.errors
                        });
                    }
                } else if (rule.required) {
                    errors.push({
                        field: field,
                        error: `Required field '${field}' is missing`
                    });
                } else if (rule.default !== undefined) {
                    mappedData[field] = rule.default;
                }
            });
        });

        // Add metadata
        mappedData._metadata = {
            mappedAt: new Date().toISOString(),
            originalFields: Object.keys(rawData),
            mappedFields: Object.keys(mappedData).filter(k => k !== '_metadata'),
            errors: errors,
            warnings: warnings,
            isValid: errors.length === 0
        };

        return mappedData;
    }

    /**
     * Extract value from raw data using source field options
     * @param {Object} data - Raw data
     * @param {Array} sources - Array of possible source field names
     * @returns {*} Extracted value or null
     */
    extractValue(data, sources) {
        for (const source of sources) {
            if (data.hasOwnProperty(source) && data[source] !== null && data[source] !== undefined && data[source] !== '') {
                return data[source];
            }
        }
        return null;
    }

    /**
     * Process and validate a single value
     * @param {*} value - Raw value
     * @param {Object} rule - Field mapping rule
     * @param {string} fieldName - Field name for error reporting
     * @returns {Object} Processing result
     */
    processValue(value, rule, fieldName) {
        const result = {
            isValid: true,
            value: value,
            errors: [],
            warnings: []
        };

        // Type conversion
        if (rule.type === 'string' && typeof value !== 'string') {
            result.value = String(value);
        } else if (rule.type === 'number' && typeof value !== 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                result.isValid = false;
                result.errors.push(`Invalid number format for field '${fieldName}'`);
                return result;
            }
            result.value = numValue;
        } else if (rule.type === 'array' && !Array.isArray(value)) {
            result.value = typeof value === 'string' ? value.split(',').map(s => s.trim()) : [value];
        }

        // Length validation
        if (rule.maxLength && typeof result.value === 'string' && result.value.length > rule.maxLength) {
            result.value = result.value.substring(0, rule.maxLength);
            result.warnings.push(`Field '${fieldName}' truncated to ${rule.maxLength} characters`);
        }

        // Range validation for numbers
        if (rule.type === 'number') {
            if (rule.min !== undefined && result.value < rule.min) {
                result.isValid = false;
                result.errors.push(`Field '${fieldName}' must be at least ${rule.min}`);
                return result;
            }
            if (rule.max !== undefined && result.value > rule.max) {
                result.isValid = false;
                result.errors.push(`Field '${fieldName}' must be at most ${rule.max}`);
                return result;
            }
        }

        // Options validation
        if (rule.options && !rule.options.includes(result.value)) {
            result.warnings.push(`Field '${fieldName}' value '${result.value}' not in predefined options`);
        }

        // Pattern validation
        if (rule.validation && this.validationRules[rule.validation]) {
            const validationRule = this.validationRules[rule.validation];
            
            if (validationRule.pattern && !validationRule.pattern.test(result.value)) {
                result.isValid = false;
                result.errors.push(validationRule.message || `Invalid format for field '${fieldName}'`);
                return result;
            }
            
            if (validationRule.transform) {
                result.value = validationRule.transform(result.value);
            }
        }

        // Transformation
        if (rule.transformation && this.transformationRules[rule.transformation]) {
            const transformMap = this.transformationRules[rule.transformation];
            const lowerValue = String(result.value).toLowerCase();
            
            if (transformMap[lowerValue]) {
                result.value = transformMap[lowerValue];
            }
        }

        // Clean string values
        if (typeof result.value === 'string') {
            result.value = result.value.trim();
        }

        return result;
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
     * Deep merge objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    mergeDeep(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Generate mapping schema for documentation
     * @returns {Object} Schema documentation
     */
    generateMappingSchema() {
        const schema = {
            title: 'GoHighLevel Webhook Data Mapping Schema',
            version: '1.0.0',
            generated: new Date().toISOString(),
            categories: {}
        };

        Object.keys(this.mappingRules).forEach(category => {
            schema.categories[category] = {
                description: this.getCategoryDescription(category),
                fields: {}
            };

            Object.keys(this.mappingRules[category]).forEach(field => {
                const rule = this.mappingRules[category][field];
                schema.categories[category].fields[field] = {
                    sources: rule.sources,
                    type: rule.type,
                    required: rule.required,
                    description: this.getFieldDescription(field),
                    validation: rule.validation,
                    options: rule.options,
                    default: rule.default,
                    maxLength: rule.maxLength
                };
            });
        });

        return schema;
    }

    /**
     * Get category description
     * @param {string} category - Category name
     * @returns {string} Description
     */
    getCategoryDescription(category) {
        const descriptions = {
            contact: 'Basic contact information for the lead',
            address: 'Property and mailing address information',
            roofing: 'Roofing-specific property details',
            service: 'Service request and preference information',
            attribution: 'Marketing attribution and tracking data',
            additional: 'Additional notes and custom fields'
        };
        
        return descriptions[category] || 'Category description not available';
    }

    /**
     * Get field description
     * @param {string} field - Field name
     * @returns {string} Description
     */
    getFieldDescription(field) {
        const descriptions = {
            firstName: 'Lead\'s first name',
            lastName: 'Lead\'s last name',
            email: 'Primary email address',
            phone: 'Primary phone number',
            address: 'Street address of property',
            city: 'City name',
            state: 'State or province',
            postalCode: 'ZIP or postal code',
            country: 'Country code (default: US)',
            propertyType: 'Type of property (residential, commercial, etc.)',
            roofType: 'Current roofing material type',
            roofAge: 'Age range of current roof',
            roofSize: 'Approximate size of roof area',
            roofCondition: 'Current condition of roof',
            serviceType: 'Type of service requested',
            urgency: 'Urgency level of request',
            preferredContactTime: 'Best time to contact lead',
            budget: 'Estimated budget range',
            source: 'Lead source (e.g., website, referral)',
            medium: 'Marketing medium',
            campaign: 'Marketing campaign name',
            notes: 'Additional notes or comments',
            tags: 'Categorization tags for the lead'
        };
        
        return descriptions[field] || 'Field description not available';
    }

    /**
     * Validate mapping configuration
     * @param {Object} customMapping - Custom mapping to validate
     * @returns {Object} Validation result
     */
    validateMappingConfig(customMapping) {
        const errors = [];
        const warnings = [];

        // Check structure
        Object.keys(customMapping).forEach(category => {
            if (!this.mappingRules[category]) {
                warnings.push(`Unknown category: ${category}`);
            } else {
                Object.keys(customMapping[category]).forEach(field => {
                    if (!this.mappingRules[category][field]) {
                        warnings.push(`Unknown field in category ${category}: ${field}`);
                    }
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebhookDataMapper;
}

// Global instance for browser environments
if (typeof window !== 'undefined') {
    window.WebhookDataMapper = WebhookDataMapper;
}