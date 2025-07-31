/**
 * Advanced Webhook Error Handler with Retry Logic
 * Comprehensive error handling, retry mechanisms, and fallback strategies
 */

class WebhookErrorHandler {
    constructor(options = {}) {
        this.options = {
            maxRetries: options.maxRetries || 3,
            baseDelay: options.baseDelay || 1000, // 1 second
            maxDelay: options.maxDelay || 30000, // 30 seconds
            exponentialBase: options.exponentialBase || 2,
            jitterRange: options.jitterRange || 0.1,
            retryableErrors: options.retryableErrors || [
                'NETWORK_ERROR',
                '500_SERVER_ERROR',
                '502_BAD_GATEWAY',
                '503_SERVICE_UNAVAILABLE',
                '504_TIMEOUT',
                '429_RATE_LIMITED'
            ],
            enableLogging: options.enableLogging !== false,
            enableMetrics: options.enableMetrics !== false,
            fallbackQueue: options.fallbackQueue || false
        };

        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            errorTypes: {},
            lastReset: new Date()
        };

        this.errorQueue = [];
        this.circuitBreaker = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            threshold: options.circuitBreakerThreshold || 5,
            timeout: options.circuitBreakerTimeout || 60000 // 1 minute
        };
    }

    /**
     * Execute webhook request with comprehensive error handling
     * @param {Function} requestFunction - Function that makes the webhook request
     * @param {Object} payload - Data to send
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Result with success/error information
     */
    async executeWithRetry(requestFunction, payload, options = {}) {
        const startTime = Date.now();
        let lastError = null;
        let attempt = 0;

        // Check circuit breaker
        if (this.circuitBreaker.isOpen) {
            if (Date.now() - this.circuitBreaker.lastFailureTime < this.circuitBreaker.timeout) {
                return this.createErrorResult(
                    'CIRCUIT_BREAKER_OPEN',
                    'Circuit breaker is open, requests temporarily blocked',
                    { circuitBreakerTimeout: this.circuitBreaker.timeout }
                );
            } else {
                // Reset circuit breaker
                this.resetCircuitBreaker();
            }
        }

        this.metrics.totalRequests++;

        while (attempt <= this.options.maxRetries) {
            try {
                this.log(`Attempt ${attempt + 1}/${this.options.maxRetries + 1}`, payload);

                const result = await requestFunction(payload, {
                    ...options,
                    attempt: attempt,
                    timeout: this.calculateTimeout(attempt)
                });

                // Success
                this.metrics.successfulRequests++;
                this.resetCircuitBreaker();
                
                if (attempt > 0) {
                    this.metrics.retriedRequests++;
                }

                this.log(`✅ Request successful after ${attempt + 1} attempts`, {
                    duration: Date.now() - startTime,
                    attempts: attempt + 1
                });

                return {
                    success: true,
                    data: result,
                    attempts: attempt + 1,
                    duration: Date.now() - startTime,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                lastError = error;
                attempt++;

                const errorAnalysis = this.analyzeError(error);
                this.recordError(errorAnalysis.type);

                this.log(`❌ Attempt ${attempt} failed: ${error.message}`, {
                    errorType: errorAnalysis.type,
                    retryable: errorAnalysis.retryable
                });

                // Check if error is retryable
                if (!errorAnalysis.retryable || attempt > this.options.maxRetries) {
                    break;
                }

                // Circuit breaker logic
                this.circuitBreaker.failureCount++;
                if (this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
                    this.openCircuitBreaker();
                }

                // Calculate delay for next attempt
                const delay = this.calculateDelay(attempt - 1);
                this.log(`⏳ Waiting ${delay}ms before retry...`);
                await this.delay(delay);
            }
        }

        // All attempts failed
        this.metrics.failedRequests++;
        
        const finalError = this.createErrorResult(
            lastError?.type || 'MAX_RETRIES_EXCEEDED',
            lastError?.message || 'Maximum retry attempts exceeded',
            {
                attempts: attempt,
                duration: Date.now() - startTime,
                lastError: lastError
            }
        );

        // Add to fallback queue if enabled
        if (this.options.fallbackQueue) {
            this.addToErrorQueue(payload, finalError);
        }

        this.log(`💥 Request failed after ${attempt} attempts`, finalError);
        return finalError;
    }

    /**
     * Analyze error to determine type and retry strategy
     * @param {Error} error - Error object
     * @returns {Object} Error analysis
     */
    analyzeError(error) {
        let errorType = 'UNKNOWN_ERROR';
        let retryable = false;
        let severity = 'medium';

        // Network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorType = 'NETWORK_ERROR';
            retryable = true;
            severity = 'high';
        }
        
        // Timeout errors
        else if (error.name === 'AbortError' || error.message.includes('timeout')) {
            errorType = '504_TIMEOUT';
            retryable = true;
            severity = 'medium';
        }
        
        // HTTP errors
        else if (error.response) {
            const status = error.response.status;
            
            if (status >= 500) {
                errorType = `${status}_SERVER_ERROR`;
                retryable = true;
                severity = 'high';
            } else if (status === 429) {
                errorType = '429_RATE_LIMITED';
                retryable = true;
                severity = 'medium';
            } else if (status === 408) {
                errorType = '408_TIMEOUT';
                retryable = true;
                severity = 'medium';
            } else if (status >= 400) {
                errorType = `${status}_CLIENT_ERROR`;
                retryable = false;
                severity = 'low';
            }
        }
        
        // JSON parsing errors
        else if (error.message.includes('JSON') || error.message.includes('parse')) {
            errorType = 'JSON_PARSE_ERROR';
            retryable = false;
            severity = 'low';
        }
        
        // CORS errors
        else if (error.message.includes('CORS')) {
            errorType = 'CORS_ERROR';
            retryable = false;
            severity = 'high';
        }

        // Check if error type is in retryable list
        if (this.options.retryableErrors.includes(errorType)) {
            retryable = true;
        }

        return {
            type: errorType,
            retryable: retryable,
            severity: severity,
            originalError: error
        };
    }

    /**
     * Calculate delay for exponential backoff with jitter
     * @param {number} attempt - Current attempt number
     * @returns {number} Delay in milliseconds
     */
    calculateDelay(attempt) {
        const exponentialDelay = this.options.baseDelay * Math.pow(this.options.exponentialBase, attempt);
        const jitter = exponentialDelay * this.options.jitterRange * (Math.random() * 2 - 1);
        const delay = Math.min(exponentialDelay + jitter, this.options.maxDelay);
        
        return Math.max(delay, 0);
    }

    /**
     * Calculate timeout for request based on attempt
     * @param {number} attempt - Current attempt number
     * @returns {number} Timeout in milliseconds
     */
    calculateTimeout(attempt) {
        const baseTimeout = 10000; // 10 seconds
        const additionalTimeout = attempt * 5000; // Add 5 seconds per attempt
        return Math.min(baseTimeout + additionalTimeout, 60000); // Max 60 seconds
    }

    /**
     * Record error in metrics
     * @param {string} errorType - Type of error
     */
    recordError(errorType) {
        if (this.options.enableMetrics) {
            this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
        }
    }

    /**
     * Create standardized error result
     * @param {string} type - Error type
     * @param {string} message - Error message
     * @param {Object} details - Additional details
     * @returns {Object} Error result
     */
    createErrorResult(type, message, details = {}) {
        return {
            success: false,
            error: {
                type: type,
                message: message,
                timestamp: new Date().toISOString(),
                ...details
            }
        };
    }

    /**
     * Open circuit breaker
     */
    openCircuitBreaker() {
        this.circuitBreaker.isOpen = true;
        this.circuitBreaker.lastFailureTime = Date.now();
        this.log('🔴 Circuit breaker opened - blocking requests temporarily');
    }

    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker() {
        if (this.circuitBreaker.isOpen || this.circuitBreaker.failureCount > 0) {
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.failureCount = 0;
            this.circuitBreaker.lastFailureTime = null;
            this.log('🟢 Circuit breaker reset');
        }
    }

    /**
     * Add failed request to error queue for later processing
     * @param {Object} payload - Original payload
     * @param {Object} error - Error details
     */
    addToErrorQueue(payload, error) {
        this.errorQueue.push({
            payload: payload,
            error: error,
            timestamp: new Date().toISOString(),
            retryCount: 0
        });

        this.log(`📥 Added to error queue (${this.errorQueue.length} items)`);
    }

    /**
     * Process error queue - retry failed requests
     * @param {Function} requestFunction - Function to retry requests
     * @returns {Promise<Array>} Results of retry attempts
     */
    async processErrorQueue(requestFunction) {
        if (this.errorQueue.length === 0) {
            return [];
        }

        this.log(`🔄 Processing error queue (${this.errorQueue.length} items)`);
        
        const results = [];
        const itemsToProcess = [...this.errorQueue];
        this.errorQueue = [];

        for (const item of itemsToProcess) {
            item.retryCount++;
            
            if (item.retryCount > 3) {
                // Skip items that have been retried too many times
                results.push({
                    payload: item.payload,
                    success: false,
                    error: 'Max queue retry attempts exceeded'
                });
                continue;
            }

            try {
                const result = await this.executeWithRetry(requestFunction, item.payload);
                results.push(result);
                
                if (!result.success) {
                    // Re-add to queue if still failing
                    this.errorQueue.push(item);
                }
            } catch (error) {
                results.push({
                    payload: item.payload,
                    success: false,
                    error: error.message
                });
                this.errorQueue.push(item);
            }

            // Add delay between queue processing
            await this.delay(1000);
        }

        return results;
    }

    /**
     * Get current metrics
     * @returns {Object} Current metrics
     */
    getMetrics() {
        const now = new Date();
        const duration = now - this.metrics.lastReset;
        
        return {
            ...this.metrics,
            duration: duration,
            successRate: this.metrics.totalRequests > 0 
                ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            retryRate: this.metrics.totalRequests > 0
                ? (this.metrics.retriedRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            queueSize: this.errorQueue.length,
            circuitBreakerStatus: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED'
        };
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            retriedRequests: 0,
            errorTypes: {},
            lastReset: new Date()
        };
        
        this.log('📊 Metrics reset');
    }

    /**
     * Clear error queue
     */
    clearErrorQueue() {
        const clearedCount = this.errorQueue.length;
        this.errorQueue = [];
        this.log(`🗑️ Cleared ${clearedCount} items from error queue`);
    }

    /**
     * Log message if logging is enabled
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    log(message, data = null) {
        if (this.options.enableLogging) {
            const timestamp = new Date().toISOString();
            if (data) {
                console.log(`[${timestamp}] WebhookErrorHandler: ${message}`, data);
            } else {
                console.log(`[${timestamp}] WebhookErrorHandler: ${message}`);
            }
        }
    }

    /**
     * Utility: Add delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create webhook request function with error handling
     * @param {string} webhookUrl - Webhook URL
     * @returns {Function} Request function
     */
    static createWebhookFunction(webhookUrl) {
        return async (payload, options = {}) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'BigTruss-Roofing-Integration/1.0',
                        ...options.headers
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.response = response;
                    throw error;
                }

                const result = await response.json().catch(() => ({}));
                return result;

            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebhookErrorHandler;
}

// Global instance for browser environments
if (typeof window !== 'undefined') {
    window.WebhookErrorHandler = WebhookErrorHandler;
}