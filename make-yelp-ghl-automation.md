# Make.com Yelp to GoHighLevel Automation Guide

## Overview
This automation monitors Yelp for new leads and automatically sends them to your GoHighLevel CRM using your existing webhook infrastructure.

**Your GoHighLevel Webhook:** [https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e](https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e)

## 🎯 3 Automation Approaches

### Option 1: Email-Based Yelp Lead Monitoring (RECOMMENDED)
**Most Reliable** - Yelp sends email notifications for new leads/messages

### Option 2: Yelp Business API Integration
**Direct API Access** - Poll Yelp Business API for new messages/reviews

### Option 3: Yelp Request-a-Quote Form Monitoring
**Form Interception** - Capture leads from Yelp's quote request system

---

## 🚀 Option 1: Email-Based Automation (Start Here)

### Step 1: Make.com Scenario Setup
1. **Log into Make.com**
2. **Create New Scenario**
3. **Add Email Trigger Module**

### Step 2: Email Trigger Configuration
```json
{
  "module": "Gmail Watch Emails",
  "settings": {
    "folder": "INBOX",
    "criteria": {
      "from": "noreply@yelp.com",
      "subject_contains": ["request", "quote", "message", "inquiry"],
      "labels": ["Yelp Leads"]
    },
    "max_results": 10
  }
}
```

### Step 3: Email Parser Module
```json
{
  "module": "Email Parser",
  "regex_patterns": {
    "customer_name": "From: ([^<]+)",
    "customer_email": "([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
    "customer_phone": "\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})",
    "message_content": "Message:(.*?)(?=\\n\\n|$)",
    "business_name": "Big Truss Roof Cleaning",
    "service_type": "(roof|gutter|pressure|cleaning|moss)"
  }
}
```

### Step 4: Data Formatter Module
```json
{
  "module": "JSON Transformer",
  "mapping": {
    "firstName": "{{split(customer_name, ' ')[0]}}",
    "lastName": "{{split(customer_name, ' ')[1]}}",
    "email": "{{customer_email}}",
    "phone": "{{customer_phone}}",
    "notes": "{{message_content}}",
    "source": "yelp",
    "medium": "email_notification",
    "campaign": "yelp_lead_automation",
    "tags": ["yelp-lead", "email-captured", "hot-lead"],
    "serviceType": "{{service_type}}",
    "propertyType": "residential",
    "urgency": "high",
    "submissionTime": "{{now}}",
    "customFields": {
      "lead_source_detail": "Yelp Business Profile",
      "capture_method": "email_parsing",
      "original_email_subject": "{{email_subject}}",
      "yelp_business_url": "https://www.yelp.com/biz/big-truss-roof-cleaning"
    }
  }
}
```

### Step 5: GoHighLevel Webhook Module
```json
{
  "module": "HTTP Make a Request",
  "settings": {
    "url": "https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "BigTruss-Make-Yelp-Integration/1.0",
      "X-Source": "yelp-automation"
    },
    "body": "{{json_output_from_transformer}}"
  }
}
```

---

## 🎯 Option 2: Yelp Business API Integration

### Prerequisites
- Yelp Business Account
- Yelp Fusion API Key
- Business ID from Yelp

### Step 1: Get Yelp API Credentials
1. Visit [Yelp Developers](https://www.yelp.com/developers)
2. Create an App
3. Get your API Key
4. Find your Business ID

### Step 2: Make.com API Polling Scenario
```json
{
  "trigger": {
    "module": "Schedule",
    "settings": {
      "interval": 15,
      "unit": "minutes"
    }
  },
  "yelp_api_call": {
    "module": "HTTP Make a Request",
    "settings": {
      "url": "https://api.yelp.com/v3/businesses/{{business_id}}/reviews",
      "method": "GET",
      "headers": {
        "Authorization": "Bearer {{yelp_api_key}}",
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Step 3: Filter New Messages
```json
{
  "module": "Filter",
  "condition": {
    "time_created": {
      "operator": "greater_than",
      "value": "{{last_check_timestamp}}"
    },
    "text": {
      "operator": "contains",
      "value": ["quote", "estimate", "price", "service"]
    }
  }
}
```

---

## 🔧 Option 3: Yelp Request-a-Quote Monitoring

### Step 1: Yelp Business Profile Setup
1. **Enable "Request a Quote" on your Yelp profile**
2. **Set up email notifications**
3. **Configure lead routing**

### Step 2: Webhook Interception
```json
{
  "module": "Webhooks - Custom Webhook",
  "settings": {
    "webhook_url": "https://hook.us1.make.com/your-webhook-id",
    "method": "POST",
    "response_type": "json"
  }
}
```

---

## 🎨 Advanced Data Mapping for GoHighLevel

### Complete Lead Data Structure
```json
{
  "firstName": "John",
  "lastName": "Smith", 
  "email": "john@example.com",
  "phone": "(778) 555-0123",
  "address": "123 Main St, Vancouver, BC",
  "city": "Vancouver",
  "state": "BC",
  "postalCode": "V6B 1A1",
  "country": "CA",
  
  "propertyType": "residential",
  "roofType": "asphalt_shingle",
  "serviceType": "roof_cleaning",
  "urgency": "high",
  "preferredContactTime": "anytime",
  
  "source": "yelp",
  "medium": "business_profile", 
  "campaign": "yelp_automation",
  "notes": "Customer inquiry from Yelp: Interested in moss removal service",
  
  "tags": [
    "yelp-lead",
    "hot-prospect", 
    "vancouver-area",
    "roof-cleaning-interest"
  ],
  
  "customFields": {
    "yelp_business_id": "big-truss-roof-cleaning-vancouver",
    "lead_score": 85,
    "estimated_value": 800,
    "followup_priority": "high",
    "capture_timestamp": "2024-07-30T22:45:00Z",
    "automation_version": "1.0"
  }
}
```

---

## 🚨 Error Handling & Monitoring

### Step 1: Add Error Handler Module
```json
{
  "module": "Error Handler",
  "settings": {
    "routes": [
      {
        "filter": "webhook_failed",
        "action": "retry_with_delay",
        "delay": 60,
        "max_attempts": 3
      },
      {
        "filter": "email_parsing_failed", 
        "action": "send_notification",
        "notification_email": "tim@bigtrussroofcleaning.com"
      }
    ]
  }
}
```

### Step 2: Logging & Analytics
```json
{
  "module": "Google Sheets - Add Row",
  "settings": {
    "spreadsheet_id": "your-tracking-sheet-id",
    "data": {
      "timestamp": "{{now}}",
      "lead_source": "yelp",
      "status": "{{webhook_response.success}}",
      "customer_name": "{{firstName}} {{lastName}}",
      "email": "{{email}}",
      "phone": "{{phone}}",
      "ghl_response": "{{webhook_response}}"
    }
  }
}
```

---

## 🔧 Testing Your Automation

### Test Data for GoHighLevel Webhook
```json
{
  "firstName": "Test",
  "lastName": "Customer",
  "email": "test@example.com", 
  "phone": "(555) 123-4567",
  "address": "123 Test St, Vancouver, BC",
  "propertyType": "residential",
  "serviceType": "roof_cleaning",
  "source": "yelp_test",
  "notes": "This is a test lead from Make.com automation",
  "tags": ["test-lead", "yelp-automation"]
}
```

### Make.com Test Steps
1. **Create test scenario**
2. **Use manual trigger** 
3. **Send test payload** to your webhook
4. **Verify GoHighLevel receives the lead**
5. **Check lead appears in GHL dashboard**

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] Yelp Business Profile optimized
- [ ] Email notifications enabled  
- [ ] Make.com scenario tested
- [ ] GoHighLevel webhook verified
- [ ] Error handling configured
- [ ] Monitoring dashboard setup

### Post-Launch
- [ ] Monitor first 48 hours closely
- [ ] Test with real Yelp inquiry
- [ ] Verify lead quality in GoHighLevel
- [ ] Adjust data mapping if needed
- [ ] Set up reporting dashboards

---

## 📊 Expected Results

### Lead Volume Estimates
- **Small Business:** 5-15 Yelp leads/month
- **Established Business:** 15-40 Yelp leads/month  
- **High-Volume Business:** 40+ Yelp leads/month

### Automation Performance
- **Response Time:** < 5 minutes from Yelp to GoHighLevel
- **Success Rate:** 95%+ with proper error handling
- **Data Accuracy:** 90%+ with email parsing

---

## 🆘 Troubleshooting Guide

### Common Issues

**1. Email Not Triggering**
- Check Gmail labels/filters
- Verify Yelp email address whitelist
- Test with manual email

**2. Webhook Failing**  
- Verify GoHighLevel webhook URL
- Check payload format matches expected structure
- Test with Postman/curl

**3. Data Mapping Errors**
- Validate email parsing regex
- Check field name mismatches  
- Test with sample data

**4. Missing Leads**
- Review Make.com execution history
- Check error logs
- Verify email delivery to monitored account

---

## 💡 Pro Tips

1. **Set up dedicated email** for Yelp notifications
2. **Use email filters** to organize leads by service type
3. **Create lead scoring** based on message content
4. **Set up instant notifications** for high-value keywords
5. **A/B test different response templates** in GoHighLevel

---

## 📈 Next Steps & Enhancements

### Phase 2 Improvements
- **AI-powered lead scoring** 
- **Automated response templates**
- **SMS notifications for urgent leads**
- **Integration with calendar booking**
- **Competitor monitoring**

### Additional Integrations
- **Google My Business** lead monitoring
- **Facebook/Instagram** lead forms
- **HomeAdvisor/Angi** lead capture
- **Thumbtack** quote requests

---

Ready to set this up? Start with **Option 1 (Email-Based)** as it's the most reliable and easiest to implement!