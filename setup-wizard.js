#!/usr/bin/env node

/**
 * N8N MCP Server Setup Wizard
 * 
 * Interactive setup wizard to configure the n8n MCP server
 * for Big Truss Roof Cleaning automation.
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SetupWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      n8n: {},
      ghl: {},
      business: {},
      email: {}
    };
  }

  async run() {
    console.log(`
╔═══════════════════════════════════════╗
║     🚀 N8N MCP Server Setup Wizard   ║
║     Big Truss Roof Cleaning          ║
╚═══════════════════════════════════════╝

This wizard will help you configure your n8n MCP server
for automated lead processing and workflow management.

`);

    try {
      await this.gatherConfiguration();
      await this.createConfigFiles();
      await this.testConnections();
      await this.showNextSteps();
    } catch (error) {
      console.error('Setup failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async gatherConfiguration() {
    console.log('📋 Let\'s gather your configuration details...\n');

    // N8N Configuration
    console.log('🔧 N8N Configuration:');
    this.config.n8n.baseUrl = await this.ask(
      'N8N Base URL (default: http://localhost:5678/api/v1): ',
      'http://localhost:5678/api/v1'
    );
    
    this.config.n8n.apiKey = await this.ask('N8N API Key (required): ');
    if (!this.config.n8n.apiKey) {
      throw new Error('N8N API Key is required. Please generate one in your n8n instance.');
    }

    this.config.n8n.webhookUrl = await this.ask(
      'N8N Webhook URL (optional): ',
      this.config.n8n.baseUrl.replace('/api/v1', '/webhook')
    );

    console.log('\n📞 GoHighLevel Configuration:');
    this.config.ghl.apiKey = await this.ask('GoHighLevel API Key (required): ');
    if (!this.config.ghl.apiKey) {
      throw new Error('GoHighLevel API Key is required for CRM integration.');
    }

    this.config.ghl.locationId = await this.ask('GoHighLevel Location ID (required): ');
    if (!this.config.ghl.locationId) {
      throw new Error('GoHighLevel Location ID is required.');
    }

    console.log('\n🏢 Business Information:');
    this.config.business.name = await this.ask(
      'Business Name: ',
      'Big Truss Roof Cleaning'
    );
    
    this.config.business.phone = await this.ask(
      'Business Phone: ',
      '+17788586355'
    );
    
    this.config.business.email = await this.ask(
      'Business Email: ',
      'tim@bigtrussroofcleaning.com'
    );

    console.log('\n📧 Email Configuration (for Yelp integration):');
    const setupEmail = await this.ask('Configure email for Yelp lead capture? (y/n): ', 'y');
    
    if (setupEmail.toLowerCase() === 'y') {
      this.config.email.host = await this.ask('Email Host (default: imap.gmail.com): ', 'imap.gmail.com');
      this.config.email.port = await this.ask('Email Port (default: 993): ', '993');
      this.config.email.user = await this.ask('Email Username: ');
      this.config.email.password = await this.ask('Email Password (App Password for Gmail): ');
    }
  }

  async createConfigFiles() {
    console.log('\n📁 Creating configuration files...');

    // Create .env file
    const envContent = this.generateEnvFile();
    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file');

    // Create config.json for additional settings
    const configContent = this.generateConfigFile();
    fs.writeFileSync('config.json', JSON.stringify(configContent, null, 2));
    console.log('✅ Created config.json file');

    // Create MCP client configuration
    const mcpConfig = this.generateMcpConfig();
    fs.writeFileSync('mcp-config.json', JSON.stringify(mcpConfig, null, 2));
    console.log('✅ Created mcp-config.json file');
  }

  async testConnections() {
    console.log('\n🔍 Testing connections...');

    try {
      // Test N8N connection
      console.log('Testing N8N connection...');
      const axios = (await import('axios')).default;
      
      const n8nClient = axios.create({
        baseURL: this.config.n8n.baseUrl,
        headers: {
          'X-N8N-API-KEY': this.config.n8n.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      const response = await n8nClient.get('/workflows');
      console.log(`✅ N8N connection successful (${response.data.length} workflows found)`);

    } catch (error) {
      console.log(`❌ N8N connection failed: ${error.message}`);
      console.log('Please check your N8N URL and API key.');
    }

    try {
      // Test GoHighLevel connection
      console.log('Testing GoHighLevel connection...');
      // Note: This is a basic test - full GHL testing would require actual API calls
      if (this.config.ghl.apiKey && this.config.ghl.locationId) {
        console.log('✅ GoHighLevel configuration looks valid');
      } else {
        console.log('❌ GoHighLevel configuration incomplete');
      }
    } catch (error) {
      console.log(`❌ GoHighLevel test failed: ${error.message}`);
    }
  }

  async showNextSteps() {
    console.log(`
🎉 Setup Complete!

📋 Next Steps:

1. 🚀 Start the MCP Server:
   npm start

2. 🔗 Connect to your AI assistant:
   Add the MCP server configuration to your AI client

3. 🛠️ Create your first workflow:
   Use the 'create_yelp_workflow' tool to set up Yelp lead capture

4. 📊 Monitor performance:
   Use 'monitor_automation_health' to track your automation

5. 📖 Read the documentation:
   Check README.md for detailed usage instructions

🔧 Configuration Files Created:
• .env - Environment variables
• config.json - Additional configuration
• mcp-config.json - MCP client configuration

💡 Pro Tips:
• Keep your API keys secure and never commit them to version control
• Test workflows in development before deploying to production
• Monitor automation health regularly for optimal performance
• Use lead scoring to prioritize high-value prospects

🆘 Need Help?
• Check the troubleshooting guide in README.md
• Review n8n documentation for workflow creation
• Contact support: tim@bigtrussroofcleaning.com

Happy automating! 🚀
`);
  }

  generateEnvFile() {
    return `# N8N MCP Server Configuration
# Generated by setup wizard on ${new Date().toISOString()}

# N8N Configuration
N8N_BASE_URL=${this.config.n8n.baseUrl}
N8N_API_KEY=${this.config.n8n.apiKey}
N8N_WEBHOOK_URL=${this.config.n8n.webhookUrl || ''}

# GoHighLevel Configuration
GHL_API_KEY=${this.config.ghl.apiKey}
GHL_LOCATION_ID=${this.config.ghl.locationId}

# Business Information
BUSINESS_NAME=${this.config.business.name}
BUSINESS_PHONE=${this.config.business.phone}
BUSINESS_EMAIL=${this.config.business.email}

# Email Configuration
EMAIL_HOST=${this.config.email.host || ''}
EMAIL_PORT=${this.config.email.port || ''}
EMAIL_USER=${this.config.email.user || ''}
EMAIL_PASSWORD=${this.config.email.password || ''}

# Environment
NODE_ENV=production
LOG_LEVEL=info
DEBUG=false
`;
  }

  generateConfigFile() {
    return {
      server: {
        name: 'n8n-automation-server',
        version: '1.0.0',
        description: 'N8N MCP Server for Big Truss Roof Cleaning'
      },
      integrations: {
        n8n: {
          enabled: true,
          baseUrl: this.config.n8n.baseUrl,
          webhookUrl: this.config.n8n.webhookUrl
        },
        gohighlevel: {
          enabled: true,
          locationId: this.config.ghl.locationId
        },
        email: {
          enabled: !!this.config.email.user,
          host: this.config.email.host,
          port: parseInt(this.config.email.port) || 993
        }
      },
      business: this.config.business,
      features: {
        leadScoring: true,
        yelpIntegration: true,
        healthMonitoring: true,
        workflowOptimization: true
      },
      defaults: {
        urgencyKeywords: ['urgent', 'asap', 'emergency', 'leak', 'damage', 'immediately', 'help'],
        leadScoringWeights: {
          phone: 20,
          email: 15,
          name: 10,
          services: 15,
          multipleServices: 10,
          messageLength: 10,
          urgency: 25,
          source: 15
        }
      }
    };
  }

  generateMcpConfig() {
    return {
      mcpServers: {
        "n8n-automation": {
          command: "node",
          args: ["n8n-mcp-server.js"],
          env: {
            N8N_BASE_URL: this.config.n8n.baseUrl,
            GHL_LOCATION_ID: this.config.ghl.locationId
          }
        }
      }
    };
  }

  ask(question, defaultValue = '') {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }
}

// Run the setup wizard
const wizard = new SetupWizard();
wizard.run().catch(console.error); 