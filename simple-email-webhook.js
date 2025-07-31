/**
 * Simple Email to GoHighLevel Webhook
 * Forward Yelp emails to this endpoint and it will parse and send to GHL
 */

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Your GoHighLevel webhook URL
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';

app.use(express.json());
app.use(express.text());

// Simple email parser
function parseEmail(emailContent) {
    const lines = emailContent.split('\n');
    
    // Extract basic info
    const fromLine = lines.find(line => line.toLowerCase().includes('from:')) || '';
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:')) || '';
    
    // Simple customer name extraction
    const nameMatch = fromLine.match(/from:\s*([^<]+)/i);
    const customerName = nameMatch ? nameMatch[1].trim() : 'Yelp Customer';
    
    // Extract email if present
    const emailMatch = emailContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/);
    const customerEmail = emailMatch ? emailMatch[1] : 'yelp-lead@bigtrussroofing.com';
    
    // Extract phone if present
    const phoneMatch = emailContent.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    const customerPhone = phoneMatch ? phoneMatch[1] : '';
    
    return {
        firstName: customerName.split(' ')[0] || 'Yelp',
        lastName: customerName.split(' ').slice(1).join(' ') || 'Customer',
        email: customerEmail,
        phone: customerPhone,
        notes: `Yelp Lead: ${subjectLine}\n\n${emailContent}`,
        source: 'yelp',
        medium: 'email_forward',
        tags: ['yelp-lead', 'email-forward'],
        serviceType: 'roof_cleaning',
        urgency: 'high'
    };
}

// Webhook endpoint for forwarded emails
app.post('/yelp-webhook', async (req, res) => {
    try {
        console.log('📧 Received email webhook');
        
        const emailContent = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const leadData = parseEmail(emailContent);
        
        console.log('📋 Parsed lead data:', leadData);
        
        // Send to GoHighLevel
        const response = await fetch(GHL_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'BigTruss-EmailForward/1.0'
            },
            body: JSON.stringify(leadData)
        });
        
        const responseText = await response.text();
        
        if (response.ok) {
            console.log('✅ Successfully sent to GoHighLevel');
            res.json({ 
                success: true, 
                message: 'Lead forwarded to GoHighLevel',
                leadData 
            });
        } else {
            console.log('❌ GoHighLevel webhook failed:', responseText);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send to GoHighLevel',
                response: responseText 
            });
        }
        
    } catch (error) {
        console.error('💥 Error processing webhook:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Email webhook server is running',
        webhookUrl: `http://localhost:${PORT}/yelp-webhook`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Email webhook server running on http://localhost:${PORT}`);
    console.log(`📧 Webhook endpoint: http://localhost:${PORT}/yelp-webhook`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

export default app;