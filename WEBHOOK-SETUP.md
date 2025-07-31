# Inbound Webhook Server Setup Guide

## Overview

Your inbound webhook server is now ready! This setup provides a comprehensive webhook receiving system that integrates with your existing GoHighLevel infrastructure.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# Required: WEBHOOK_SECRET, GHL_API_KEY, GHL_LOCATION_ID
```

### 3. Start the Webhook Server
```bash
# Production
npm run webhook

# Development (auto-restart on changes)
npm run webhook:dev
```

### 4. Test the Setup
```bash
# Run automated tests
npm run webhook:test

# Or test manually (server must be running)
npm run webhook:test:manual
```

## 📡 Available Endpoints

Your webhook server provides these endpoints:

### Health & Monitoring
- `GET /health` - Server health check
- `GET /metrics` - Performance metrics and statistics

### Webhook Endpoints
- `POST /webhook/[source]` - Generic webhook (auto-detects source)
- `POST /webhook/yelp` - Yelp-specific webhook
- `POST /webhook/facebook` - Facebook lead ads webhook  
- `POST /webhook/google` - Google Ads webhook
- `POST /webhook/website` - Website form webhook
- `POST /webhook/test` - Testing endpoint

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBHOOK_PORT` | 3000 | Server port |
| `WEBHOOK_HOST` | 0.0.0.0 | Server host |
| `WEBHOOK_SECRET` | - | Webhook signature validation key |
| `GHL_API_KEY` | - | GoHighLevel API key |
| `GHL_LOCATION_ID` | - | GoHighLevel location ID |
| `ENABLE_SECURITY` | true | Enable security headers |
| `ENABLE_LOGGING` | true | Enable request logging |
| `FORWARD_TO_GHL` | true | Forward to GoHighLevel |
| `RATE_LIMIT_MAX` | 100 | Requests per window |
| `RATE_LIMIT_WINDOW` | 900000 | Rate limit window (15 min) |

### Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Signature Validation**: Validates webhook signatures when `WEBHOOK_SECRET` is set
- **Security Headers**: Helmet.js security headers
- **CORS Protection**: Configurable CORS settings
- **Input Validation**: Comprehensive payload validation

## 📊 Data Flow

1. **Receive**: Webhook received from external source
2. **Validate**: Signature validation and payload parsing
3. **Map**: Data mapping using existing `WebhookDataMapper`
4. **Process**: Error handling with `WebhookErrorHandler`
5. **Forward**: Send to GoHighLevel using existing integration
6. **Log**: Activity logging and metrics collection

## 🧪 Testing

### Automated Testing
```bash
npm run webhook:test
```
Tests health endpoints, validation, rate limiting, and multiple payload formats.

### Manual Testing
```bash
# Start server
npm run webhook

# In another terminal, run manual tests
npm run webhook:test:manual
```

### Manual cURL Testing
```bash
# Test basic webhook
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith", 
    "email": "john@example.com",
    "phone": "555-123-4567",
    "serviceType": "estimate"
  }'

# Test health check
curl http://localhost:3000/health

# Test metrics
curl http://localhost:3000/metrics
```

## 🔗 Integration Examples

### Yelp Lead Integration
Configure Yelp to send leads to:
```
POST https://your-domain.com/webhook/yelp
```

Expected payload format:
```json
{
  "name": "Customer Name",
  "phone": "(555) 123-4567", 
  "email": "customer@email.com",
  "message": "Service request details",
  "service": "Roof Cleaning"
}
```

### Website Form Integration
Point your website forms to:
```
POST https://your-domain.com/webhook/website
```

Expected payload format:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com", 
  "phone": "555-123-4567",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "serviceType": "estimate",
  "notes": "Customer notes"
}
```

### Facebook Lead Ads
Configure Facebook Lead Ads webhook:
```
POST https://your-domain.com/webhook/facebook
```

## 📈 Monitoring

### Metrics Available
- Total requests processed
- Success/failure rates  
- Requests by source
- Response times
- Error types and rates
- Queue status

### Health Monitoring
The `/health` endpoint provides:
- Server status
- Uptime information
- Performance metrics
- Component health

## 🚨 Error Handling

The server includes comprehensive error handling:

- **Circuit Breaker**: Prevents cascade failures
- **Retry Logic**: Exponential backoff with jitter
- **Error Queue**: Failed requests queued for retry
- **Graceful Degradation**: Fallback modes when components fail

## 🔒 Security Best Practices

1. **Set WEBHOOK_SECRET**: Always use webhook signature validation
2. **Use HTTPS**: Deploy with SSL/TLS certificates
3. **Firewall**: Restrict access to known source IPs when possible
4. **Monitor**: Watch metrics for unusual patterns
5. **Rate Limits**: Adjust rate limiting based on your needs

## 📝 Troubleshooting

### Server Won't Start
- Check port availability: `lsof -i :3000`
- Verify environment variables in `.env`
- Check dependencies: `npm install`

### Webhooks Not Processing
- Verify endpoint URL is correct
- Check server logs for errors
- Test with `/webhook/test` endpoint first
- Validate payload format matches expected structure

### GoHighLevel Integration Issues
- Verify `GHL_API_KEY` and `GHL_LOCATION_ID` in `.env`
- Check GoHighLevel webhook URL in existing integration
- Review error handler logs for retry attempts

### Performance Issues
- Check metrics at `/metrics` endpoint
- Review rate limiting settings
- Monitor server resources (CPU, memory)
- Consider scaling if needed

## 🛠️ Development

### File Structure
```
├── inbound-webhook-server.js    # Main server implementation
├── webhook-test.js              # Testing suite
├── webhook-data-mapper.js       # Existing data mapping (reused)
├── webhook-error-handler.js     # Existing error handling (reused) 
├── gohighlevel-webhook-integration.js # Existing GHL integration (reused)
└── .env.example                 # Environment template
```

### Adding New Sources
1. Add new route in `setupRoutes()` method
2. Create source-specific validation if needed
3. Add tests in `webhook-test.js`
4. Update documentation

### Extending Functionality
The server is designed to integrate with your existing components:
- Data mapping rules can be customized in `WebhookDataMapper`
- Error handling behavior configured in `WebhookErrorHandler`  
- GoHighLevel integration uses existing `GoHighLevelWebhook` class

## 🌐 Deployment

### Local Development
```bash
npm run webhook:dev
```

### Production
```bash
# Set NODE_ENV=production in .env
npm run webhook
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "webhook"]
```

### Process Manager (PM2)
```bash
npm install -g pm2
pm2 start inbound-webhook-server.js --name "webhook-server"
pm2 startup
pm2 save
```

---

## 🎉 You're Ready!

Your inbound webhook server is now set up and ready to receive leads from multiple sources. The system will:

1. ✅ Receive webhooks from Yelp, Facebook, website forms, etc.
2. ✅ Validate and map data using your existing infrastructure  
3. ✅ Forward processed leads to GoHighLevel automatically
4. ✅ Handle errors gracefully with retry logic
5. ✅ Provide monitoring and metrics
6. ✅ Scale with your business needs

Need help? Check the logs, review the test results, or examine the metrics endpoint for insights into what's happening.