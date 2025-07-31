#!/usr/bin/env node

/**
 * Inbound Webhook Server for Big Truss Roof Cleaning
 * 
 * Comprehensive webhook receiver that integrates with existing infrastructure:
 * - Receives webhooks from external sources (Yelp, Facebook, etc.)
 * - Validates and processes incoming data
 * - Maps data using existing WebhookDataMapper
 * - Forwards to GoHighLevel using existing integration
 * - Handles errors with existing WebhookErrorHandler
 * - Logs activities and provides monitoring
 */

import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import existing components (they may need to be loaded dynamically)
let WebhookDataMapper, WebhookErrorHandler, GoHighLevelWebhook;

try {
    const dataMapperModule = await import('./webhook-data-mapper.js');
    WebhookDataMapper = dataMapperModule.default || dataMapperModule.WebhookDataMapper;
} catch (error) {
    console.warn('⚠️ Could not load WebhookDataMapper, using fallback');
    WebhookDataMapper = class {
        mapData(data) {
            return { ...data, _metadata: { isValid: true, errors: [], warnings: [], mappedFields: Object.keys(data) } };
        }
    };
}

try {
    const errorHandlerModule = await import('./webhook-error-handler.js');
    WebhookErrorHandler = errorHandlerModule.default || errorHandlerModule.WebhookErrorHandler;
} catch (error) {
    console.warn('⚠️ Could not load WebhookErrorHandler, using fallback');
    WebhookErrorHandler = class {
        constructor() {}
        async executeWithRetry(fn, data) { return await fn(data); }
        getMetrics() { return {}; }
        resetMetrics() {}
        static createWebhookFunction(url) {
            return async (payload) => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                return await response.json();
            };
        }
    };
}

try {
    const ghlModule = await import('./gohighlevel-webhook-integration.js');
    GoHighLevelWebhook = ghlModule.default || ghlModule.GoHighLevelWebhook;
} catch (error) {
    console.warn('⚠️ Could not load GoHighLevelWebhook, using fallback');
    GoHighLevelWebhook = class {
        constructor() {
            this.webhookUrl = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';
        }
    };
}

class InboundWebhookServer {
    constructor(options = {}) {
        this.options = {
            port: options.port || process.env.WEBHOOK_PORT || 3000,
            host: options.host || process.env.WEBHOOK_HOST || '0.0.0.0',
            enableSecurity: options.enableSecurity !== false,
            enableLogging: options.enableLogging !== false,
            enableMetrics: options.enableMetrics !== false,
            maxPayloadSize: options.maxPayloadSize || '10mb',
            enableCors: options.enableCors !== false,
            rateLimitWindow: options.rateLimitWindow || 15 * 60 * 1000, // 15 minutes
            rateLimitMax: options.rateLimitMax || 100, // 100 requests per window
            webhookSecret: options.webhookSecret || process.env.WEBHOOK_SECRET,
            forwardToGHL: options.forwardToGHL !== false,
            enableN8nIntegration: options.enableN8nIntegration !== false
        };

        // Initialize components
        this.app = express();
        this.dataMapper = new WebhookDataMapper();
        this.errorHandler = new WebhookErrorHandler({
            enableLogging: this.options.enableLogging,
            enableMetrics: this.options.enableMetrics,
            fallbackQueue: true
        });
        this.ghlWebhook = new GoHighLevelWebhook();

        // Metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            bySource: {},
            byEndpoint: {},
            lastReset: new Date()
        };

        // Setup middleware and routes
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Security headers
        if (this.options.enableSecurity) {
            this.app.use(helmet({
                contentSecurityPolicy: false // Disable CSP for webhooks
            }));
        }

        // CORS
        if (this.options.enableCors) {
            this.app.use(cors({
                origin: true, // Allow all origins for webhooks
                credentials: false
            }));
        }

        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.options.rateLimitWindow,
            max: this.options.rateLimitMax,
            message: {
                error: 'Too many requests',
                message: 'Rate limit exceeded'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/webhook', limiter);

        // Body parsing
        this.app.use(express.json({ 
            limit: this.options.maxPayloadSize,
            verify: (req, res, buf) => {
                // Store raw body for signature verification
                req.rawBody = buf;
            }
        }));
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: this.options.maxPayloadSize 
        }));

        // Request logging
        if (this.options.enableLogging) {
            this.app.use((req, res, next) => {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
                next();
            });
        }

        // Request metrics
        this.app.use((req, res, next) => {
            req.startTime = Date.now();
            this.metrics.totalRequests++;
            
            const endpoint = req.path;
            this.metrics.byEndpoint[endpoint] = (this.metrics.byEndpoint[endpoint] || 0) + 1;
            
            next();
        });
    }

    /**
     * Setup webhook routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                metrics: this.getMetrics()
            });
        });

        // Metrics endpoint
        this.app.get('/metrics', (req, res) => {
            res.json({
                server: this.getMetrics(),
                errorHandler: this.errorHandler.getMetrics(),
                dataMapper: this.dataMapper.generateMappingSchema()
            });
        });

        // Generic webhook endpoint
        this.app.post('/webhook/:source?', async (req, res) => {
            await this.handleWebhook(req, res);
        });

        // Source-specific endpoints
        this.app.post('/webhook/yelp', async (req, res) => {
            req.webhookSource = 'yelp';
            await this.handleWebhook(req, res);
        });

        this.app.post('/webhook/facebook', async (req, res) => {
            req.webhookSource = 'facebook';
            await this.handleWebhook(req, res);
        });

        this.app.post('/webhook/google', async (req, res) => {
            req.webhookSource = 'google';
            await this.handleWebhook(req, res);
        });

        this.app.post('/webhook/website', async (req, res) => {
            req.webhookSource = 'website';
            await this.handleWebhook(req, res);
        });

        // Test endpoint
        this.app.post('/webhook/test', async (req, res) => {
            req.webhookSource = 'test';
            req.skipForwarding = !req.body.forward;
            await this.handleWebhook(req, res);
        });

        // Catch-all for undefined routes
        this.app.all('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: 'Available endpoints: GET /health, GET /metrics, POST /webhook/[source]'
            });
        });
    }

    /**
     * Handle incoming webhook requests
     */
    async handleWebhook(req, res) {
        const startTime = Date.now();
        const source = req.webhookSource || req.params.source || 'unknown';
        const requestId = this.generateRequestId();

        try {
            this.log(`📨 Webhook received from: ${source}`, { requestId, ip: req.ip });

            // Validate signature if secret is configured
            if (this.options.webhookSecret && !req.skipForwarding) {
                const isValid = this.validateSignature(req);
                if (!isValid) {
                    this.metrics.failedRequests++;
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Invalid webhook signature',
                        requestId
                    });
                }
            }

            // Extract and validate payload
            const payload = this.extractPayload(req);
            if (!payload) {
                this.metrics.failedRequests++;
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid or empty payload',
                    requestId
                });
            }

            // Add source and metadata
            payload.source = source;
            payload.receivedAt = new Date().toISOString();
            payload.requestId = requestId;

            // Map data using existing mapper
            const mappedData = this.dataMapper.mapData(payload);
            
            if (!mappedData._metadata.isValid) {
                this.log(`❌ Data validation failed`, {
                    requestId,
                    errors: mappedData._metadata.errors
                });
                
                this.metrics.failedRequests++;
                return res.status(422).json({
                    error: 'Validation Failed',
                    message: 'Data validation errors',
                    errors: mappedData._metadata.errors,
                    requestId
                });
            }

            // Log successful processing
            this.log(`✅ Data mapped successfully`, {
                requestId,
                source,
                fields: mappedData._metadata.mappedFields.length,
                warnings: mappedData._metadata.warnings.length
            });

            // Update metrics
            this.metrics.successfulRequests++;
            this.metrics.bySource[source] = (this.metrics.bySource[source] || 0) + 1;

            // Forward to GoHighLevel if enabled
            let forwardResult = null;
            if (this.options.forwardToGHL && !req.skipForwarding) {
                forwardResult = await this.forwardToGoHighLevel(mappedData, requestId);
            }

            // Send response
            const duration = Date.now() - startTime;
            const response = {
                success: true,
                message: 'Webhook processed successfully',
                requestId,
                source,
                duration,
                data: {
                    mapped: mappedData._metadata.mappedFields,
                    warnings: mappedData._metadata.warnings
                }
            };

            if (forwardResult) {
                response.forwarded = forwardResult;
            }

            res.status(200).json(response);

        } catch (error) {
            this.metrics.failedRequests++;
            
            this.log(`💥 Webhook processing failed`, {
                requestId,
                source,
                error: error.message,
                stack: error.stack
            });

            const duration = Date.now() - startTime;
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to process webhook',
                requestId,
                duration
            });
        }
    }

    /**
     * Validate webhook signature
     */
    validateSignature(req) {
        if (!this.options.webhookSecret) return true;

        const signature = req.headers['x-webhook-signature'] || 
                         req.headers['x-hub-signature-256'] || 
                         req.headers['x-signature'];
        
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', this.options.webhookSecret)
            .update(req.rawBody)
            .digest('hex');

        const receivedSignature = signature.replace('sha256=', '');
        
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(receivedSignature, 'hex')
        );
    }

    /**
     * Extract payload from request
     */
    extractPayload(req) {
        // Try JSON body first
        if (req.body && Object.keys(req.body).length > 0) {
            return req.body;
        }

        // Try form data
        if (req.body && typeof req.body === 'object') {
            return req.body;
        }

        // Try query parameters
        if (req.query && Object.keys(req.query).length > 0) {
            return req.query;
        }

        return null;
    }

    /**
     * Forward processed data to GoHighLevel
     */
    async forwardToGoHighLevel(mappedData, requestId) {
        try {
            this.log(`🚀 Forwarding to GoHighLevel`, { requestId });

            const forwardFunction = this.errorHandler.constructor.createWebhookFunction(
                this.ghlWebhook.webhookUrl
            );

            const result = await this.errorHandler.executeWithRetry(
                forwardFunction,
                mappedData,
                { 
                    headers: { 'X-Request-ID': requestId },
                    timeout: 15000 
                }
            );

            if (result.success) {
                this.log(`✅ Successfully forwarded to GoHighLevel`, {
                    requestId,
                    attempts: result.attempts,
                    duration: result.duration
                });
            } else {
                this.log(`❌ Failed to forward to GoHighLevel`, {
                    requestId,
                    error: result.error,
                    attempts: result.attempts
                });
            }

            return {
                success: result.success,
                attempts: result.attempts,
                duration: result.duration,
                error: result.success ? null : result.error
            };

        } catch (error) {
            this.log(`💥 Forward to GoHighLevel failed`, {
                requestId,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.log(`💥 Uncaught Exception: ${error.message}`, { stack: error.stack });
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.log(`💥 Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            this.log('🛑 SIGTERM received, shutting down gracefully');
            this.shutdown();
        });

        process.on('SIGINT', () => {
            this.log('🛑 SIGINT received, shutting down gracefully');
            this.shutdown();
        });
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        const now = new Date();
        const duration = now - this.metrics.lastReset;
        
        return {
            ...this.metrics,
            duration,
            successRate: this.metrics.totalRequests > 0 
                ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
                : '0%',
            requestsPerMinute: this.metrics.totalRequests > 0
                ? ((this.metrics.totalRequests / duration) * 60000).toFixed(2)
                : '0',
            uptime: process.uptime()
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
            bySource: {},
            byEndpoint: {},
            lastReset: new Date()
        };
        
        this.errorHandler.resetMetrics();
        this.log('📊 Metrics reset');
    }

    /**
     * Log message if logging is enabled
     */
    log(message, data = null) {
        if (this.options.enableLogging) {
            const timestamp = new Date().toISOString();
            if (data) {
                console.log(`[${timestamp}] InboundWebhookServer: ${message}`, data);
            } else {
                console.log(`[${timestamp}] InboundWebhookServer: ${message}`);
            }
        }
    }

    /**
     * Start the server
     */
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.options.port, this.options.host, () => {
                    this.log(`🚀 Inbound Webhook Server started`);
                    this.log(`📡 Listening on ${this.options.host}:${this.options.port}`);
                    this.log(`🔒 Security: ${this.options.enableSecurity ? 'Enabled' : 'Disabled'}`);
                    this.log(`🔑 Signature validation: ${this.options.webhookSecret ? 'Enabled' : 'Disabled'}`);
                    this.log(`📊 Forwarding to GHL: ${this.options.forwardToGHL ? 'Enabled' : 'Disabled'}`);
                    
                    resolve({
                        port: this.options.port,
                        host: this.options.host,
                        endpoints: [
                            'GET /health',
                            'GET /metrics', 
                            'POST /webhook/[source]',
                            'POST /webhook/yelp',
                            'POST /webhook/facebook',
                            'POST /webhook/google',
                            'POST /webhook/website',
                            'POST /webhook/test'
                        ]
                    });
                });

                this.server.on('error', (error) => {
                    this.log(`💥 Server error: ${error.message}`);
                    reject(error);
                });

            } catch (error) {
                this.log(`💥 Failed to start server: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Stop the server
     */
    async shutdown() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    this.log('🛑 Server stopped');
                    resolve();
                });
            });
        }
    }

    /**
     * Test the webhook server with sample data
     */
    async testWebhook(source = 'test', sampleData = null) {
        const testData = sampleData || {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            phone: '555-123-4567',
            address: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            serviceType: 'roof-inspection',
            notes: 'Test webhook from inbound server',
            source: source
        };

        this.log(`🧪 Running webhook test with source: ${source}`);

        try {
            const response = await fetch(`http://localhost:${this.options.port}/webhook/${source}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...testData, forward: false })
            });

            const result = await response.json();
            
            if (result.success) {
                this.log(`✅ Webhook test successful`, result);
            } else {
                this.log(`❌ Webhook test failed`, result);
            }

            return result;

        } catch (error) {
            this.log(`💥 Webhook test error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// Export the class
export { InboundWebhookServer };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new InboundWebhookServer({
        port: process.env.PORT || 3000,
        enableLogging: true,
        enableMetrics: true,
        webhookSecret: process.env.WEBHOOK_SECRET
    });

    server.start().then((info) => {
        console.log('🎉 Inbound Webhook Server is ready!');
        console.log('📋 Available endpoints:');
        info.endpoints.forEach(endpoint => console.log(`   ${endpoint}`));
        console.log('\n💡 Try these test commands:');
        console.log(`   curl -X POST http://localhost:${info.port}/webhook/test -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'`);
        console.log(`   curl http://localhost:${info.port}/health`);
        console.log(`   curl http://localhost:${info.port}/metrics`);
    }).catch((error) => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });
}