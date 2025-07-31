// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Quote form submission with multiple integration options
function setupFormHandler(formId) {
    const form = document.getElementById(formId);
    if (!form) return; // Form doesn't exist on this page
    
    form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const data = {};
    
    // Process form data
    for (let [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
            // Handle checkbox arrays
            const cleanKey = key.replace('[]', '');
            if (!data[cleanKey]) {
                data[cleanKey] = [];
            }
            data[cleanKey].push(value);
        } else {
            data[key] = value;
        }
    }
    
    // Add timestamp and source tracking
    data.timestamp = new Date().toISOString();
    data.source = 'Landing Page Form';
    data.lead_type = 'Quote Request';
    data.page_url = window.location.href;
    data.user_agent = navigator.userAgent;
    
    console.log('Form data:', data);
    
    // Submit to automation platforms (Choose one or use both as backup)
    submitToMakecom(data);        // Primary: Make.com
    // submitToN8n(data);         // Alternative: N8n
    // submitToGoHighLevel(data); // Fallback: Direct GHL
    
    // Show success message
    showSuccessMessage();
    
    // Reset form
    this.reset();
    });
}

// Make.com Integration (RECOMMENDED)
function submitToMakecom(data) {
    // Replace with your actual Make.com webhook URL
    const makeWebhook = 'https://hook.make.com/YOUR_WEBHOOK_ID';
    
    // Format data for Make.com scenario
    const makeData = {
        // Contact Information
        contact: {
            name: data.name,
            firstName: data.name.split(' ')[0] || '',
            lastName: data.name.split(' ').slice(1).join(' ') || '',
            phone: data.phone,
            email: data.email,
            address: data.address,
            source: 'Website Form',
            tags: ['Website Lead', 'Quote Request']
        },
        
        // Lead Details
        lead: {
            services_requested: data.services ? data.services.join(', ') : '',
            message: data.message || '',
            urgency_level: determineUrgency(data.message),
            lead_score: calculateLeadScore(data),
            integration_source: 'make_com'
        },
        
        // Opportunity
        opportunity: {
            title: `Website Quote - ${data.name}`,
            status: 'open',
            value: estimateValue(data.services),
            source: 'Website',
            pipeline_stage: 'New Lead'
        },
        
        // Metadata
        metadata: {
            timestamp: data.timestamp,
            page_url: data.page_url,
            user_agent: data.user_agent,
            form_version: '1.0'
        }
    };
    
    // Send to Make.com
    fetch(makeWebhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(makeData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Make.com Success:', result);
        trackConversion('make_com_success');
    })
    .catch(error => {
        console.error('Make.com Error:', error);
        // Fallback to N8n or direct GHL
        submitToN8n(data);
    });
}

// N8n Integration (ALTERNATIVE)
function submitToN8n(data) {
    // Replace with your N8n webhook URL
    const n8nWebhook = 'https://your-n8n-instance.com/webhook/yelp-leads';
    
    // Format data for N8n workflow
    const n8nData = {
        trigger: 'website_form',
        contact: {
            full_name: data.name,
            phone_number: data.phone,
            email_address: data.email,
            service_address: data.address,
            lead_source: 'Website'
        },
        services: data.services || [],
        message: data.message || '',
        metadata: {
            timestamp: data.timestamp,
            urgency: determineUrgency(data.message),
            lead_score: calculateLeadScore(data),
            browser_info: {
                url: data.page_url,
                user_agent: data.user_agent
            }
        }
    };
    
    fetch(n8nWebhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('N8n Success:', result);
        trackConversion('n8n_success');
        
        // NEW: Also send to MCP server for AI analysis
        sendToMcpServer(data, result);
    })
    .catch(error => {
        console.error('N8n Error:', error);
        // Final fallback to direct GoHighLevel
        submitToGoHighLevel(data);
    });
}

// NEW: Integration with N8N MCP Server
function sendToMcpServer(leadData, workflowResult) {
    // This function would typically be called by an AI assistant
    // with MCP access, but we can also trigger analysis directly
    
    const mcpData = {
        action: 'analyze_lead_data',
        lead_data: {
            name: leadData.name,
            phone: leadData.phone,
            email: leadData.email,
            services: leadData.services,
            message: leadData.message,
            source: 'Website'
        },
        workflow_result: workflowResult,
        timestamp: new Date().toISOString()
    };
    
    // Store for MCP server processing
    localStorage.setItem('latest_lead_data', JSON.stringify(mcpData));
    console.log('Lead data prepared for MCP analysis:', mcpData);
    
    // If MCP server webhook is available, send directly
    const mcpWebhook = getMcpWebhookUrl();
    if (mcpWebhook) {
        fetch(mcpWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mcpData)
        })
        .then(response => response.json())
        .then(result => {
            console.log('MCP Server analysis:', result);
            displayLeadInsights(result);
        })
        .catch(error => {
            console.log('MCP Server not available:', error.message);
        });
    }
}

// NEW: Get MCP webhook URL from configuration
function getMcpWebhookUrl() {
    // This would be configured during setup
    return localStorage.getItem('mcp_webhook_url') || null;
}

// NEW: Display AI-generated lead insights
function displayLeadInsights(mcpResult) {
    if (!mcpResult || !mcpResult.insights) return;
    
    // Create insights panel
    const insightsPanel = document.createElement('div');
    insightsPanel.className = 'lead-insights-panel';
    insightsPanel.innerHTML = `
        <div class="insights-header">
            <h3>🎯 AI Lead Analysis</h3>
            <button class="close-insights">×</button>
        </div>
        <div class="insights-content">
            <div class="lead-score">
                <span class="score-label">Lead Score:</span>
                <span class="score-value">${mcpResult.insights.score}/100</span>
            </div>
            <div class="priority-level">
                <span class="priority-${mcpResult.insights.priority.toLowerCase()}">
                    ${mcpResult.insights.priority} Priority
                </span>
            </div>
            <div class="recommendations">
                <h4>Recommendations:</h4>
                <ul>
                    ${mcpResult.insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .lead-insights-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10001;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
        }
        
        .insights-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .insights-header h3 {
            margin: 0;
            color: #2563eb;
        }
        
        .close-insights {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }
        
        .insights-content {
            padding: 1rem;
        }
        
        .lead-score {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .score-value {
            font-weight: bold;
            color: #10b981;
        }
        
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #f59e0b; font-weight: bold; }
        .priority-low { color: #6b7280; }
        
        .recommendations ul {
            margin: 0.5rem 0;
            padding-left: 1.2rem;
        }
        
        .recommendations li {
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(insightsPanel);
    
    // Close functionality
    insightsPanel.querySelector('.close-insights').addEventListener('click', () => {
        insightsPanel.remove();
        style.remove();
    });
    
    // Auto-close after 15 seconds
    setTimeout(() => {
        if (document.body.contains(insightsPanel)) {
            insightsPanel.remove();
            style.remove();
        }
    }, 15000);
}

// NEW: Enhanced lead scoring with MCP integration
function calculateLeadScore(data) {
    let score = 0;
    
    // Contact completeness
    if (data.phone && data.phone.length >= 10) score += 20;
    if (data.email && data.email.includes('@')) score += 15;
    if (data.address && data.address.length > 10) score += 10;
    
    // Service selection
    if (data.services && data.services.length > 0) score += 15;
    if (data.services && data.services.length > 1) score += 10; // Multiple services
    
    // Message quality
    if (data.message && data.message.length > 20) score += 10;
    if (data.message && data.message.length > 100) score += 5; // Detailed message
    
    // Urgency indicators
    if (determineUrgency(data.message) === 'high') score += 25;
    
    // NEW: Time of day bonus (business hours = higher priority)
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 18) score += 5; // Business hours bonus
    
    // NEW: Device type analysis
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) score += 3; // Mobile users often need quicker response
    
    return Math.min(score, 100); // Cap at 100
}

// NEW: Enhanced urgency detection with ML-style analysis
function determineUrgency(message) {
    if (!message) return 'normal';
    
    const messageText = message.toLowerCase();
    
    // High urgency keywords (emergency situations)
    const highUrgencyKeywords = ['emergency', 'urgent', 'asap', 'immediate', 'leak', 'damage', 'falling', 'dangerous'];
    
    // Medium urgency keywords (time-sensitive but not emergency)
    const mediumUrgencyKeywords = ['soon', 'quickly', 'today', 'this week', 'problem', 'issue', 'concerned'];
    
    // Context analysis
    const emergencyPhrases = [
        'roof leak', 'water damage', 'emergency repair', 'tiles falling', 
        'dangerous condition', 'structural damage', 'storm damage'
    ];
    
    // Check for emergency phrases first
    for (let phrase of emergencyPhrases) {
        if (messageText.includes(phrase)) {
            return 'critical';
        }
    }
    
    // Check for high urgency keywords
    for (let keyword of highUrgencyKeywords) {
        if (messageText.includes(keyword)) {
            return 'high';
        }
    }
    
    // Check for medium urgency keywords
    for (let keyword of mediumUrgencyKeywords) {
        if (messageText.includes(keyword)) {
            return 'medium';
        }
    }
    
    return 'normal';
}

// NEW: MCP Server Health Check
function checkMcpServerHealth() {
    const mcpWebhook = getMcpWebhookUrl();
    if (!mcpWebhook) return;
    
    fetch(`${mcpWebhook}/health`, { method: 'GET' })
        .then(response => response.json())
        .then(result => {
            console.log('MCP Server Health:', result);
            if (result.status === 'healthy') {
                displayHealthStatus('🟢 MCP Server Online');
            } else {
                displayHealthStatus('🟡 MCP Server Issues');
            }
        })
        .catch(error => {
            console.log('MCP Server Health Check Failed:', error);
            displayHealthStatus('🔴 MCP Server Offline');
        });
}

// NEW: Display health status
function displayHealthStatus(status) {
    const statusElement = document.createElement('div');
    statusElement.className = 'mcp-health-status';
    statusElement.textContent = status;
    statusElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    
    document.body.appendChild(statusElement);
    
    setTimeout(() => {
        if (document.body.contains(statusElement)) {
            statusElement.remove();
        }
    }, 3000);
}

// NEW: Initialize MCP integration on page load
function initializeMcpIntegration() {
    // Check if MCP configuration exists
    const mcpConfig = localStorage.getItem('mcp_config');
    if (mcpConfig) {
        try {
            const config = JSON.parse(mcpConfig);
            if (config.webhook_url) {
                localStorage.setItem('mcp_webhook_url', config.webhook_url);
                console.log('MCP Server integration initialized');
                checkMcpServerHealth();
            }
        } catch (error) {
            console.warn('Invalid MCP configuration:', error);
        }
    }
}

// GoHighLevel Direct Integration (FALLBACK)
function submitToGoHighLevel(data) {
    // Replace with your actual GoHighLevel webhook URL
    const webhook_url = 'https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID';
    
    // Format data for GoHighLevel
    const ghlData = {
        contact: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            address1: data.address,
            tags: ['Website Lead', 'Quote Request', 'Fallback']
        },
        opportunity: {
            title: `Quote Request - ${data.name}`,
            status: 'open',
            value: 0,
            source: 'Website'
        },
        customFields: {
            services_requested: data.services ? data.services.join(', ') : '',
            message: data.message || '',
            lead_source: 'Landing Page',
            integration_method: 'direct_ghl'
        }
    };
    
    fetch(webhook_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('GoHighLevel Success:', result);
        trackConversion('ghl_direct_success');
    })
    .catch(error => {
        console.error('GoHighLevel Error:', error);
        // Final fallback: send backup notification
        sendBackupNotification(data);
    });
}

// Helper Functions
function estimateValue(services) {
    if (!services || services.length === 0) return 0;
    
    const serviceValues = {
        'roof-cleaning': 300,
        'gutter-cleaning': 150,
        'pressure-washing': 200,
        'window-cleaning': 100
    };
    
    let totalValue = 0;
    services.forEach(service => {
        totalValue += serviceValues[service] || 100;
    });
    
    return totalValue;
}

function showSuccessMessage() {
    // Enhanced success message with animation
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Thank You!</h3>
            <p>Your quote request has been submitted successfully.</p>
            <p><strong>Tim will contact you within 1 hour!</strong></p>
            <p>For urgent needs, call: <a href="tel:+17788586355">(778) 858-6355</a></p>
        </div>
    `;
    
    // Add CSS for success message
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        }
        
        .success-content i {
            font-size: 3rem;
            color: #10b981;
            margin-bottom: 1rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
        style.remove();
    }, 5000);
    
    // Close on click
    successDiv.addEventListener('click', () => {
        successDiv.remove();
        style.remove();
    });
}

function trackConversion(method) {
    // Track successful form submissions
    const trackingData = {
        event: 'form_submission_success',
        method: method,
        timestamp: new Date().toISOString(),
        page_url: window.location.href
    };
    
    console.log('Conversion tracked:', trackingData);
    
    // Send to analytics (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            'event_category': 'Lead Generation',
            'event_label': method,
            'value': 1
        });
    }
}

// Backup notification system
function sendBackupNotification(data) {
    // Fallback email notification if all integrations fail
    const emailData = {
        to: 'tim@bigtrussroofcleaning.com',
        subject: 'URGENT: New Quote Request - Integration Failed',
        body: `
            ⚠️ INTEGRATION FAILURE - MANUAL FOLLOW-UP REQUIRED ⚠️
            
            A new quote request was submitted but integration failed.
            Please follow up immediately:
            
            Name: ${data.name}
            Phone: ${data.phone}
            Email: ${data.email}
            Address: ${data.address}
            Services: ${data.services ? data.services.join(', ') : 'Not specified'}
            Message: ${data.message || 'None'}
            
            Timestamp: ${data.timestamp}
            Urgency: ${determineUrgency(data.message)}
            Lead Score: ${calculateLeadScore(data)}
            
            CONTACT IMMEDIATELY!
        `
    };
    
    console.log('Backup Email Notification:', emailData);
    
    // Show user a different message for technical issues
    alert('Thank you for your request! Due to technical issues, Tim will contact you within 2 hours. For immediate assistance, please call (778) 858-6355.');
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'white';
        header.style.backdropFilter = 'none';
    }
});

// Click-to-call tracking
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        // Track phone clicks for analytics
        const phoneNumber = this.href.replace('tel:', '');
        console.log('Phone call initiated:', phoneNumber);
        
        // Send tracking data to automation platforms
        trackPhoneCall(phoneNumber);
    });
});

// Track phone calls
function trackPhoneCall(phoneNumber) {
    const trackingData = {
        event: 'phone_call_clicked',
        phone_number: phoneNumber,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
    };
    
    // Send to Make.com for phone call tracking
    const phoneTrackingWebhook = 'https://hook.make.com/YOUR_PHONE_TRACKING_WEBHOOK';
    
    fetch(phoneTrackingWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
    })
    .then(response => console.log('Phone call tracked'))
    .catch(error => console.log('Phone tracking failed:', error));
    
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_click', {
            'event_category': 'Lead Generation',
            'event_label': phoneNumber,
            'value': 1
        });
    }
}

// Add loading states and form validation
function addFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return; // Form doesn't exist on this page
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    form.addEventListener('submit', function() {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
        
        // Re-enable after processing (handled by success/error callbacks)
        setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Get My Free Quote';
            }
        }, 10000); // 10 second timeout
    });
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Setup form handlers for both index and contact pages
    setupFormHandler('quote-form');          // Index page form
    setupFormHandler('contact-quote-form');  // Contact page form
    
    // Setup form validation for both forms
    addFormValidation('quote-form');
    addFormValidation('contact-quote-form');
    
    initializeMcpIntegration(); // NEW: Initialize MCP integration
    handleFaqDeepLinks(); // Initialize FAQ deep linking
    console.log('Big Truss Roof Cleaning - Landing Page Loaded with Enhanced N8n/MCP Integration');
    
    // NEW: Periodic health checks
    setInterval(checkMcpServerHealth, 300000); // Check every 5 minutes
});

// FAQ Toggle Functionality
function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    const allQuestions = document.querySelectorAll('.faq-question');
    const allAnswers = document.querySelectorAll('.faq-answer');
    
    // Close all other FAQs
    allQuestions.forEach(q => {
        if (q !== element) {
            q.classList.remove('active');
        }
    });
    allAnswers.forEach(a => {
        if (a !== answer) {
            a.classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    element.classList.toggle('active');
    answer.classList.toggle('active');
    
    // Track FAQ interactions for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'faq_interaction', {
            'event_category': 'User Engagement',
            'event_label': element.querySelector('h3').textContent.trim(),
            'value': element.classList.contains('active') ? 1 : 0
        });
    }
}

// Auto-expand FAQ based on URL hash
function handleFaqDeepLinks() {
    if (window.location.hash && window.location.hash.startsWith('#faq-')) {
        const faqIndex = parseInt(window.location.hash.replace('#faq-', '')) - 1;
        const faqQuestions = document.querySelectorAll('.faq-question');
        if (faqQuestions[faqIndex]) {
            setTimeout(() => {
                toggleFaq(faqQuestions[faqIndex]);
                faqQuestions[faqIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
}

// NEW: Export functions for MCP server testing
if (typeof window !== 'undefined') {
    window.BigTrussAutomation = {
        sendToMcpServer,
        calculateLeadScore,
        determineUrgency,
        checkMcpServerHealth,
        toggleFaq // Add FAQ function to exports
    };
} 