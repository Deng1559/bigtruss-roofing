#!/usr/bin/env node

/**
 * Setup N8N Yelp to GoHighLevel Automation
 * Imports the workflow and configures credentials
 */

import fs from 'fs';
import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupN8nYelpAutomation() {
  console.log('🚀 N8N Yelp to GoHighLevel Automation Setup');
  console.log('==========================================\n');

  // Get n8n configuration
  const n8nUrl = await askQuestion('Enter your n8n URL (e.g., http://localhost:5678): ');
  const n8nApiKey = await askQuestion('Enter your n8n API key: ');
  const gmailEmail = await askQuestion('Enter Gmail address for Yelp monitoring: ');
  
  console.log('\n⚙️  Setting up automation...\n');

  try {
    // Load workflow JSON
    const workflowData = JSON.parse(fs.readFileSync('n8n-yelp-ghl-workflow.json', 'utf8'));
    
    // Configure axios for n8n API
    const n8nApi = axios.create({
      baseURL: n8nUrl.replace(/\/$/, ''),
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json'
      }
    });

    // Import workflow
    console.log('📥 Importing Yelp automation workflow...');
    const workflowResponse = await n8nApi.post('/api/v1/workflows', workflowData);
    const workflowId = workflowResponse.data.id;
    console.log(`✅ Workflow imported successfully (ID: ${workflowId})`);

    // Setup Gmail credentials (if needed)
    console.log('🔐 Setting up Gmail credentials...');
    
    const gmailCredential = {
      name: 'Gmail OAuth2 - BigTruss',
      type: 'gmailOAuth2',
      data: {
        email: gmailEmail,
        // Note: User will need to configure OAuth2 in n8n UI
      }
    };

    try {
      await n8nApi.post('/api/v1/credentials', gmailCredential);
      console.log('✅ Gmail credential placeholder created');
    } catch (error) {
      console.log('⚠️  Gmail credential exists or needs manual setup');
    }

    // Activate workflow
    console.log('🚀 Activating workflow...');
    await n8nApi.patch(`/api/v1/workflows/${workflowId}/activate`);
    console.log('✅ Workflow activated successfully!');

    console.log('\n🎯 Setup Complete!');
    console.log('================\n');
    console.log('Your n8n Yelp automation is now ready! Here\'s what happens next:\n');
    console.log('1. 📧 Monitors your Gmail for Yelp notifications every 15 minutes');
    console.log('2. 🤖 Automatically extracts customer information');
    console.log('3. 📤 Sends leads to your GoHighLevel CRM');
    console.log('4. 📱 Sends you instant email notifications');
    console.log('5. 📊 Includes lead scoring and analytics\n');
    
    console.log('🔧 Next Steps:');
    console.log('1. Go to your n8n interface:', n8nUrl);
    console.log('2. Configure Gmail OAuth2 credentials (if not done)');
    console.log('3. Test the workflow with a sample Yelp email');
    console.log('4. Monitor the execution log for any issues\n');

    console.log('🧪 Testing:');
    console.log('- Forward any old Yelp email to yourself to test');
    console.log('- Check your GoHighLevel for new leads');
    console.log('- Look for notification emails\n');

    console.log('📊 Monitoring:');
    console.log(`- Workflow URL: ${n8nUrl}/workflow/${workflowId}`);
    console.log('- Execution history available in n8n interface');
    console.log('- Email notifications for each captured lead\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify n8n is running and accessible');
    console.log('2. Check your API key permissions');
    console.log('3. Ensure n8n version supports the workflow format');
    console.log('4. Try importing the workflow manually via n8n UI');
  } finally {
    rl.close();
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupN8nYelpAutomation();
}

export default setupN8nYelpAutomation;