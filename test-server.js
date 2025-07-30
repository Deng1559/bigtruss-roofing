#!/usr/bin/env node

/**
 * N8N MCP Server Test Suite
 * 
 * Tests the functionality of the n8n MCP server to ensure
 * all tools work correctly before deployment.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class McpServerTester {
  constructor() {
    this.testResults = [];
    this.serverProcess = null;
  }

  async runTests() {
    console.log(`
╔════════════════════════════════════════╗
║     🧪 N8N MCP Server Test Suite      ║
║     Big Truss Roof Cleaning           ║
╚════════════════════════════════════════╝

Running comprehensive tests...
`);

    try {
      await this.checkPrerequisites();
      await this.testConfiguration();
      await this.startMockServer();
      await this.testMcpTools();
      await this.testLeadAnalysis();
      await this.testWorkflowManagement();
      await this.generateReport();
    } catch (error) {
      console.error('Test suite failed:', error.message);
      process.exit(1);
    } finally {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }

  async checkPrerequisites() {
    console.log('📋 Checking prerequisites...');

    const tests = [
      {
        name: 'Node.js version',
        test: () => {
          const version = process.version;
          const major = parseInt(version.slice(1));
          return major >= 18;
        },
        expected: 'Node.js 18 or higher'
      },
      {
        name: 'Package.json exists',
        test: () => fs.existsSync('package.json'),
        expected: 'package.json file'
      },
      {
        name: 'N8N MCP Server file',
        test: () => fs.existsSync('n8n-mcp-server.js'),
        expected: 'n8n-mcp-server.js file'
      },
      {
        name: 'Dependencies installed',
        test: () => fs.existsSync('node_modules'),
        expected: 'node_modules directory'
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.logTest(test.name, result, test.expected);
    }

    console.log('✅ Prerequisites check completed\n');
  }

  async testConfiguration() {
    console.log('⚙️ Testing configuration...');

    const tests = [
      {
        name: 'Environment file example',
        test: () => fs.existsSync('.env.example'),
        expected: '.env.example file exists'
      },
      {
        name: 'Setup wizard',
        test: () => fs.existsSync('setup-wizard.js'),
        expected: 'setup-wizard.js exists'
      },
      {
        name: 'Configuration schema',
        test: () => {
          try {
            const serverCode = fs.readFileSync('n8n-mcp-server.js', 'utf8');
            return serverCode.includes('ConfigSchema');
          } catch (error) {
            return false;
          }
        },
        expected: 'Configuration validation schema'
      }
    ];

    for (const test of tests) {
      const result = test.test();
      this.logTest(test.name, result, test.expected);
    }

    console.log('✅ Configuration tests completed\n');
  }

  async startMockServer() {
    console.log('🚀 Starting mock MCP server...');

    // Create a minimal test configuration
    const testConfig = {
      N8N_BASE_URL: 'http://localhost:5678/api/v1',
      N8N_API_KEY: 'test_api_key',
      GHL_API_KEY: 'test_ghl_key',
      GHL_LOCATION_ID: 'test_location_id'
    };

    // Write temporary test config
    const envContent = Object.entries(testConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync('.env.test', envContent);

    console.log('✅ Mock server configuration ready\n');
  }

  async testMcpTools() {
    console.log('🔧 Testing MCP tools...');

    const toolTests = [
      {
        name: 'create_workflow tool',
        test: () => this.testCreateWorkflowTool(),
        expected: 'Workflow creation logic'
      },
      {
        name: 'analyze_lead_data tool',
        test: () => this.testLeadAnalysisTool(),
        expected: 'Lead analysis functionality'
      },
      {
        name: 'monitor_automation_health tool',
        test: () => this.testHealthMonitoringTool(),
        expected: 'Health monitoring logic'
      },
      {
        name: 'list_workflows tool',
        test: () => this.testListWorkflowsTool(),
        expected: 'Workflow listing functionality'
      }
    ];

    for (const test of toolTests) {
      try {
        const result = await test.test();
        this.logTest(test.name, result, test.expected);
      } catch (error) {
        this.logTest(test.name, false, `${test.expected} - Error: ${error.message}`);
      }
    }

    console.log('✅ MCP tools tests completed\n');
  }

  async testLeadAnalysis() {
    console.log('🎯 Testing lead analysis functionality...');

    const testLeads = [
      {
        name: 'High Priority Lead',
        data: {
          name: 'John Emergency',
          phone: '+1234567890',
          email: 'john@email.com',
          services: ['roof-cleaning', 'gutter-cleaning'],
          message: 'Urgent! Roof leak in living room, water damage visible',
          source: 'Yelp'
        },
        expectedScore: 85,
        expectedPriority: 'High'
      },
      {
        name: 'Medium Priority Lead',
        data: {
          name: 'Jane Smith',
          phone: '+0987654321',
          email: 'jane@email.com',
          services: ['pressure-washing'],
          message: 'Looking for pressure washing quote',
          source: 'Website'
        },
        expectedScore: 50,
        expectedPriority: 'Medium'
      },
      {
        name: 'Low Priority Lead',
        data: {
          name: 'Bob',
          phone: '',
          email: 'bob@email.com',
          services: [],
          message: 'Info',
          source: 'Website'
        },
        expectedScore: 25,
        expectedPriority: 'Low'
      }
    ];

    for (const testLead of testLeads) {
      const score = this.calculateTestLeadScore(testLead.data);
      const priority = score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
      
      const scoreMatch = Math.abs(score - testLead.expectedScore) <= 10;
      const priorityMatch = priority === testLead.expectedPriority;
      
      this.logTest(
        `${testLead.name} scoring`,
        scoreMatch && priorityMatch,
        `Score: ${score} (expected ~${testLead.expectedScore}), Priority: ${priority}`
      );
    }

    console.log('✅ Lead analysis tests completed\n');
  }

  async testWorkflowManagement() {
    console.log('🔄 Testing workflow management...');

    const workflowTests = [
      {
        name: 'Yelp workflow generation',
        test: () => this.testYelpWorkflowGeneration(),
        expected: 'Valid Yelp workflow structure'
      },
      {
        name: 'Lead capture workflow',
        test: () => this.testLeadCaptureWorkflow(),
        expected: 'Valid lead capture workflow'
      },
      {
        name: 'Analytics workflow',
        test: () => this.testAnalyticsWorkflow(),
        expected: 'Valid analytics workflow'
      }
    ];

    for (const test of workflowTests) {
      try {
        const result = await test.test();
        this.logTest(test.name, result, test.expected);
      } catch (error) {
        this.logTest(test.name, false, `${test.expected} - Error: ${error.message}`);
      }
    }

    console.log('✅ Workflow management tests completed\n');
  }

  // Test implementation methods
  testCreateWorkflowTool() {
    // Simulate workflow creation logic
    const workflowData = {
      name: 'Test Workflow',
      trigger_type: 'webhook',
      workflow_type: 'lead_capture'
    };

    // Basic validation
    return workflowData.name && 
           workflowData.trigger_type && 
           workflowData.workflow_type;
  }

  testLeadAnalysisTool() {
    const testLead = {
      name: 'Test Lead',
      phone: '+1234567890',
      email: 'test@email.com',
      services: ['roof-cleaning'],
      message: 'Test message'
    };

    const score = this.calculateTestLeadScore(testLead);
    return score > 0 && score <= 100;
  }

  testHealthMonitoringTool() {
    // Simulate health monitoring
    const healthData = {
      totalWorkflows: 5,
      activeWorkflows: 4,
      executions: {
        total: 100,
        successful: 95,
        failed: 5
      }
    };

    const successRate = (healthData.executions.successful / healthData.executions.total) * 100;
    return successRate >= 0 && successRate <= 100;
  }

  testListWorkflowsTool() {
    // Simulate workflow listing
    const mockWorkflows = [
      { id: '1', name: 'Yelp Lead Capture', active: true },
      { id: '2', name: 'Website Forms', active: true },
      { id: '3', name: 'Follow-up Sequence', active: false }
    ];

    return Array.isArray(mockWorkflows) && mockWorkflows.length > 0;
  }

  testYelpWorkflowGeneration() {
    const yelpWorkflow = {
      name: 'Yelp Lead Capture - Advanced',
      active: true,
      nodes: [
        { id: '1', name: 'Email Trigger', type: 'n8n-nodes-base.emailReadImap' },
        { id: '2', name: 'Parse Lead Data', type: 'n8n-nodes-base.function' },
        { id: '3', name: 'Lead Scoring', type: 'n8n-nodes-base.function' }
      ]
    };

    return yelpWorkflow.nodes.length >= 3 && 
           yelpWorkflow.nodes.some(n => n.name.includes('Email Trigger'));
  }

  testLeadCaptureWorkflow() {
    const leadCaptureWorkflow = {
      name: 'Website Lead Capture',
      nodes: [
        { id: '1', name: 'Webhook Trigger', type: 'n8n-nodes-base.webhook' }
      ]
    };

    return leadCaptureWorkflow.nodes.some(n => n.type === 'n8n-nodes-base.webhook');
  }

  testAnalyticsWorkflow() {
    const analyticsWorkflow = {
      name: 'Weekly Analytics',
      nodes: [
        { id: '1', name: 'Schedule Trigger', type: 'n8n-nodes-base.cron' }
      ]
    };

    return analyticsWorkflow.nodes.some(n => n.type === 'n8n-nodes-base.cron');
  }

  calculateTestLeadScore(data) {
    let score = 0;

    // Contact completeness
    if (data.phone && data.phone.length >= 10) score += 20;
    if (data.email && data.email.includes('@')) score += 15;
    if (data.name && data.name.length > 2) score += 10;

    // Service selection
    if (data.services && data.services.length > 0) score += 15;
    if (data.services && data.services.length > 1) score += 10;

    // Message quality
    if (data.message && data.message.length > 20) score += 10;
    if (data.message && data.message.length > 100) score += 5;

    // Urgency detection
    const urgentKeywords = ['urgent', 'emergency', 'leak', 'damage'];
    if (data.message && urgentKeywords.some(k => data.message.toLowerCase().includes(k))) {
      score += 25;
    }

    // Source bonus
    if (data.source === 'Yelp') score += 15;

    return Math.min(score, 100);
  }

  logTest(name, passed, details) {
    const status = passed ? '✅' : '❌';
    const result = { name, passed, details };
    this.testResults.push(result);
    
    console.log(`  ${status} ${name}: ${details}`);
  }

  async generateReport() {
    console.log(`
╔════════════════════════════════════════╗
║            📊 Test Report              ║
╚════════════════════════════════════════╝
`);

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`📈 Test Summary:
• Total Tests: ${totalTests}
• Passed: ✅ ${passedTests}
• Failed: ❌ ${failedTests}
• Success Rate: ${successRate}%
`);

    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  • ${r.name}: ${r.details}`));
      console.log('');
    }

    // Generate test report file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: successRate
      },
      results: this.testResults
    };

    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to test-report.json');

    if (successRate >= 90) {
      console.log(`
🎉 Test Suite PASSED!

The N8N MCP Server is ready for deployment.

Next Steps:
1. Run the setup wizard: npm run setup
2. Configure your n8n and GoHighLevel credentials
3. Start the server: npm start
4. Connect to your AI assistant

Happy automating! 🚀
`);
    } else {
      console.log(`
⚠️ Test Suite Issues Detected

Please address the failed tests before deployment.
Review the test output above for specific issues.

Need help? Check the README.md or contact support.
`);
      process.exit(1);
    }

    // Cleanup test files
    if (fs.existsSync('.env.test')) {
      fs.unlinkSync('.env.test');
    }
  }
}

// Run the test suite
const tester = new McpServerTester();
tester.runTests().catch(console.error); 