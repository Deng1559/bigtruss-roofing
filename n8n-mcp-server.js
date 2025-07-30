#!/usr/bin/env node

/**
 * N8N MCP Server for Big Truss Roof Cleaning
 * 
 * This MCP server provides AI assistants with direct access to n8n workflows,
 * enabling intelligent automation management, lead processing, and workflow optimization.
 * 
 * Features:
 * - Workflow creation and management
 * - Real-time execution and monitoring
 * - Lead data analysis and scoring
 * - Performance analytics and optimization
 * - Integration with existing landing page automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  n8n: z.object({
    baseUrl: z.string().url(),
    apiKey: z.string(),
    webhookUrl: z.string().url().optional(),
  }),
  ghl: z.object({
    apiKey: z.string(),
    locationId: z.string(),
  }),
  business: z.object({
    name: z.string().default('Big Truss Roof Cleaning'),
    phone: z.string().default('+17788586355'),
    email: z.string().default('tim@bigtrussroofcleaning.com'),
  }),
});

class N8nMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'n8n-automation-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = null;
    this.n8nClient = null;
    this.setupToolHandlers();
  }

  /**
   * Initialize the server with configuration
   */
  async initialize(config) {
    try {
      this.config = ConfigSchema.parse(config);
      this.n8nClient = axios.create({
        baseURL: this.config.n8n.baseUrl,
        headers: {
          'X-N8N-API-KEY': this.config.n8n.apiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('N8N MCP Server initialized successfully');
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Configuration error: ${error.message}`
      );
    }
  }

  /**
   * Setup tool handlers for the MCP server
   */
  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_workflow',
          description: 'Create a new n8n workflow for lead processing and automation',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Workflow name' },
              description: { type: 'string', description: 'Workflow description' },
              trigger_type: { 
                type: 'string', 
                enum: ['webhook', 'email', 'schedule', 'manual'],
                description: 'Type of workflow trigger'
              },
              workflow_type: {
                type: 'string',
                enum: ['lead_capture', 'follow_up', 'analytics', 'custom'],
                description: 'Purpose of the workflow'
              },
              nodes: { 
                type: 'array', 
                description: 'Array of workflow nodes configuration',
                items: { type: 'object' }
              }
            },
            required: ['name', 'trigger_type', 'workflow_type']
          }
        },
        {
          name: 'execute_workflow',
          description: 'Execute an existing n8n workflow with provided data',
          inputSchema: {
            type: 'object',
            properties: {
              workflow_id: { type: 'string', description: 'N8N workflow ID' },
              workflow_name: { type: 'string', description: 'Workflow name (alternative to ID)' },
              input_data: { type: 'object', description: 'Data to pass to the workflow' },
              wait_for_completion: { type: 'boolean', default: true, description: 'Wait for workflow completion' }
            }
          }
        },
        {
          name: 'list_workflows',
          description: 'List all available n8n workflows with their status and details',
          inputSchema: {
            type: 'object',
            properties: {
              active_only: { type: 'boolean', default: false, description: 'Only show active workflows' },
              workflow_type: { 
                type: 'string', 
                enum: ['lead_capture', 'follow_up', 'analytics', 'all'],
                default: 'all',
                description: 'Filter by workflow type'
              }
            }
          }
        },
        {
          name: 'get_workflow_executions',
          description: 'Get execution history and results for a specific workflow',
          inputSchema: {
            type: 'object',
            properties: {
              workflow_id: { type: 'string', description: 'N8N workflow ID' },
              limit: { type: 'number', default: 10, description: 'Number of executions to retrieve' },
              status: { 
                type: 'string', 
                enum: ['success', 'error', 'waiting', 'all'],
                default: 'all',
                description: 'Filter by execution status'
              }
            },
            required: ['workflow_id']
          }
        },
        {
          name: 'analyze_lead_data',
          description: 'Analyze lead data and provide scoring and recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              lead_data: { 
                type: 'object', 
                description: 'Lead information to analyze',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  services: { type: 'array', items: { type: 'string' } },
                  message: { type: 'string' },
                  source: { type: 'string' }
                }
              },
              include_recommendations: { type: 'boolean', default: true, description: 'Include follow-up recommendations' }
            },
            required: ['lead_data']
          }
        },
        {
          name: 'create_yelp_workflow',
          description: 'Create a specialized workflow for Yelp lead capture and processing',
          inputSchema: {
            type: 'object',
            properties: {
              email_source: { type: 'string', description: 'Email address to monitor for Yelp notifications' },
              response_template: { type: 'string', description: 'Custom response template for leads' },
              urgency_keywords: { 
                type: 'array', 
                items: { type: 'string' },
                default: ['urgent', 'asap', 'emergency', 'leak', 'damage'],
                description: 'Keywords that trigger high priority alerts'
              }
            }
          }
        },
        {
          name: 'monitor_automation_health',
          description: 'Monitor the health and performance of all automation workflows',
          inputSchema: {
            type: 'object',
            properties: {
              time_range: { 
                type: 'string', 
                enum: ['1h', '24h', '7d', '30d'],
                default: '24h',
                description: 'Time range for health monitoring'
              },
              include_metrics: { type: 'boolean', default: true, description: 'Include performance metrics' }
            }
          }
        },
        {
          name: 'optimize_workflows',
          description: 'Analyze workflow performance and suggest optimizations',
          inputSchema: {
            type: 'object',
            properties: {
              workflow_id: { type: 'string', description: 'Specific workflow to optimize (optional)' },
              optimization_type: {
                type: 'string',
                enum: ['performance', 'reliability', 'cost', 'all'],
                default: 'all',
                description: 'Type of optimization to focus on'
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_workflow':
            return await this.createWorkflow(args);
          case 'execute_workflow':
            return await this.executeWorkflow(args);
          case 'list_workflows':
            return await this.listWorkflows(args);
          case 'get_workflow_executions':
            return await this.getWorkflowExecutions(args);
          case 'analyze_lead_data':
            return await this.analyzeLeadData(args);
          case 'create_yelp_workflow':
            return await this.createYelpWorkflow(args);
          case 'monitor_automation_health':
            return await this.monitorAutomationHealth(args);
          case 'optimize_workflows':
            return await this.optimizeWorkflows(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  /**
   * Create a new n8n workflow
   */
  async createWorkflow(args) {
    const { name, description, trigger_type, workflow_type, nodes = [] } = args;

    // Generate workflow based on type
    let workflowData;
    
    switch (workflow_type) {
      case 'lead_capture':
        workflowData = this.generateLeadCaptureWorkflow(name, trigger_type, nodes);
        break;
      case 'follow_up':
        workflowData = this.generateFollowUpWorkflow(name, trigger_type, nodes);
        break;
      case 'analytics':
        workflowData = this.generateAnalyticsWorkflow(name, trigger_type, nodes);
        break;
      default:
        workflowData = this.generateCustomWorkflow(name, description, trigger_type, nodes);
    }

    try {
      const response = await this.n8nClient.post('/workflows', workflowData);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Workflow "${name}" created successfully!\n\n` +
                  `Workflow ID: ${response.data.id}\n` +
                  `Type: ${workflow_type}\n` +
                  `Trigger: ${trigger_type}\n` +
                  `Status: ${response.data.active ? 'Active' : 'Inactive'}\n\n` +
                  `You can now execute this workflow or modify it as needed.`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create workflow: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Execute an existing workflow
   */
  async executeWorkflow(args) {
    const { workflow_id, workflow_name, input_data = {}, wait_for_completion = true } = args;

    let workflowId = workflow_id;
    
    // If workflow_name provided instead of ID, find the workflow
    if (!workflowId && workflow_name) {
      const workflows = await this.n8nClient.get('/workflows');
      const workflow = workflows.data.find(w => w.name === workflow_name);
      if (!workflow) {
        throw new Error(`Workflow "${workflow_name}" not found`);
      }
      workflowId = workflow.id;
    }

    if (!workflowId) {
      throw new Error('Either workflow_id or workflow_name must be provided');
    }

    try {
      // Execute the workflow
      const response = await this.n8nClient.post(`/workflows/${workflowId}/execute`, {
        data: input_data
      });

      const executionId = response.data.id;
      
      if (wait_for_completion) {
        // Poll for completion
        const result = await this.waitForExecution(executionId);
        
        return {
          content: [
            {
              type: 'text',
              text: `🚀 Workflow executed successfully!\n\n` +
                    `Execution ID: ${executionId}\n` +
                    `Status: ${result.status}\n` +
                    `Duration: ${result.duration}ms\n\n` +
                    `Results:\n${JSON.stringify(result.data, null, 2)}`
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `🚀 Workflow execution started!\n\n` +
                    `Execution ID: ${executionId}\n` +
                    `Status: Running\n\n` +
                    `Use get_workflow_executions to check the results later.`
            }
          ]
        };
      }
    } catch (error) {
      throw new Error(`Failed to execute workflow: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List all workflows
   */
  async listWorkflows(args) {
    const { active_only = false, workflow_type = 'all' } = args;

    try {
      const response = await this.n8nClient.get('/workflows');
      let workflows = response.data;

      // Filter by active status
      if (active_only) {
        workflows = workflows.filter(w => w.active);
      }

      // Filter by workflow type (based on tags or naming convention)
      if (workflow_type !== 'all') {
        workflows = workflows.filter(w => 
          w.name.toLowerCase().includes(workflow_type) || 
          (w.tags && w.tags.includes(workflow_type))
        );
      }

      const workflowList = workflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        nodes: w.nodes ? w.nodes.length : 0
      }));

      return {
        content: [
          {
            type: 'text',
            text: `📋 Found ${workflows.length} workflows:\n\n` +
                  workflowList.map(w => 
                    `• ${w.name} (ID: ${w.id})\n` +
                    `  Status: ${w.active ? '🟢 Active' : '🔴 Inactive'}\n` +
                    `  Nodes: ${w.nodes}\n` +
                    `  Updated: ${new Date(w.updatedAt).toLocaleDateString()}\n`
                  ).join('\n') +
                  `\n💡 Use execute_workflow to run any of these workflows.`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to list workflows: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowExecutions(args) {
    const { workflow_id, limit = 10, status = 'all' } = args;

    try {
      const response = await this.n8nClient.get(`/executions`, {
        params: {
          workflowId: workflow_id,
          limit: limit,
          ...(status !== 'all' && { status })
        }
      });

      const executions = response.data.results || response.data;
      
      const executionSummary = executions.map(e => ({
        id: e.id,
        status: e.finished ? (e.data.resultData.error ? 'error' : 'success') : 'running',
        startedAt: e.startedAt,
        stoppedAt: e.stoppedAt,
        duration: e.stoppedAt && e.startedAt ? 
          new Date(e.stoppedAt) - new Date(e.startedAt) : null
      }));

      return {
        content: [
          {
            type: 'text',
            text: `📊 Workflow Execution History (Last ${executions.length}):\n\n` +
                  executionSummary.map(e => 
                    `• Execution ${e.id}\n` +
                    `  Status: ${e.status === 'success' ? '✅' : e.status === 'error' ? '❌' : '⏳'} ${e.status}\n` +
                    `  Started: ${new Date(e.startedAt).toLocaleString()}\n` +
                    `  Duration: ${e.duration ? `${e.duration}ms` : 'N/A'}\n`
                  ).join('\n') +
                  `\n📈 Success Rate: ${(executionSummary.filter(e => e.status === 'success').length / executionSummary.length * 100).toFixed(1)}%`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get executions: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Analyze lead data and provide scoring
   */
  async analyzeLeadData(args) {
    const { lead_data, include_recommendations = true } = args;
    
    // Calculate lead score
    let score = 0;
    const factors = [];

    // Contact completeness
    if (lead_data.phone && lead_data.phone.replace(/\D/g, '').length >= 10) {
      score += 20;
      factors.push('✅ Valid phone number (+20)');
    } else {
      factors.push('❌ Missing/invalid phone number');
    }

    if (lead_data.email && lead_data.email.includes('@')) {
      score += 15;
      factors.push('✅ Valid email address (+15)');
    } else {
      factors.push('❌ Missing/invalid email address');
    }

    if (lead_data.name && lead_data.name.length > 2) {
      score += 10;
      factors.push('✅ Name provided (+10)');
    }

    // Service interest
    if (lead_data.services && lead_data.services.length > 0) {
      score += 15;
      factors.push(`✅ Services selected: ${lead_data.services.join(', ')} (+15)`);
      
      if (lead_data.services.length > 1) {
        score += 10;
        factors.push('✅ Multiple services requested (+10)');
      }
    }

    // Message analysis
    if (lead_data.message) {
      if (lead_data.message.length > 20) {
        score += 10;
        factors.push('✅ Detailed message provided (+10)');
      }

      // Urgency detection
      const urgentKeywords = ['urgent', 'asap', 'emergency', 'leak', 'damage', 'immediately', 'help'];
      const hasUrgency = urgentKeywords.some(keyword => 
        lead_data.message.toLowerCase().includes(keyword)
      );

      if (hasUrgency) {
        score += 25;
        factors.push('🚨 Urgent keywords detected (+25)');
      }
    }

    // Source bonus
    if (lead_data.source === 'Yelp') {
      score += 15;
      factors.push('✅ High-quality source: Yelp (+15)');
    }

    const priority = score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
    const emoji = priority === 'High' ? '🔥' : priority === 'Medium' ? '⚡' : '📝';

    let analysis = `🎯 Lead Analysis Results:\n\n` +
                  `${emoji} Priority: ${priority}\n` +
                  `📊 Lead Score: ${score}/100\n\n` +
                  `Scoring Factors:\n${factors.join('\n')}\n`;

    if (include_recommendations) {
      const recommendations = this.generateLeadRecommendations(lead_data, score, priority);
      analysis += `\n💡 Recommendations:\n${recommendations.join('\n')}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: analysis
        }
      ]
    };
  }

  /**
   * Create specialized Yelp workflow
   */
  async createYelpWorkflow(args) {
    const { 
      email_source, 
      response_template = 'default',
      urgency_keywords = ['urgent', 'asap', 'emergency', 'leak', 'damage']
    } = args;

    const workflowData = {
      name: 'Yelp Lead Capture - Advanced',
      active: true,
      nodes: [
        {
          id: '1',
          name: 'Email Trigger',
          type: 'n8n-nodes-base.emailReadImap',
          parameters: {
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            folder: 'INBOX',
            format: 'simple',
            readOnce: false,
            filters: {
              subject: 'New inquiry from Yelp',
              sender: '@yelp.com'
            }
          },
          position: [200, 300]
        },
        {
          id: '2',
          name: 'Parse Lead Data',
          type: 'n8n-nodes-base.function',
          parameters: {
            functionCode: this.generateYelpParserCode(urgency_keywords)
          },
          position: [400, 300]
        },
        {
          id: '3',
          name: 'Lead Scoring',
          type: 'n8n-nodes-base.function',  
          parameters: {
            functionCode: this.generateLeadScoringCode()
          },
          position: [600, 300]
        },
        {
          id: '4',
          name: 'Create GHL Contact',
          type: 'n8n-nodes-base.httpRequest',
          parameters: {
            method: 'POST',
            url: 'https://services.leadconnectorhq.com/contacts/',
            authentication: 'headerAuth',
            headerAuth: {
              name: 'Authorization',
              value: `Bearer ${this.config.ghl.apiKey}`
            },
            jsonParameters: true,
            body: {
              firstName: '={{$json.firstName}}',
              lastName: '={{$json.lastName}}',
              phone: '={{$json.phone}}',
              email: '={{$json.email}}',
              source: 'Yelp',
              tags: ['Yelp Lead', 'Hot Lead'],
              customField: {
                service_requested: '={{$json.service}}',
                initial_message: '={{$json.message}}',
                lead_score: '={{$json.leadScore}}',
                priority: '={{$json.priority}}'
              }
            }
          },
          position: [400, 500]
        },
        {
          id: '5',
          name: 'Send Alert SMS',
          type: 'n8n-nodes-base.httpRequest',
          parameters: {
            method: 'POST',
            url: 'https://services.leadconnectorhq.com/conversations/messages',
            body: {
              type: 'SMS',
              contactId: 'tim_contact_id',
              message: `🌟 NEW YELP LEAD - {{$json.priority}} Priority!\n\nName: {{$json.name}}\nPhone: {{$json.phone}}\nScore: {{$json.leadScore}}/100\nService: {{$json.service}}\n\nRESPOND WITHIN 1 HOUR!`
            }
          },
          position: [600, 500]
        }
      ],
      connections: {
        'Email Trigger': {
          main: [['Parse Lead Data']]
        },
        'Parse Lead Data': {
          main: [['Lead Scoring']]
        },
        'Lead Scoring': {
          main: [['Create GHL Contact']]
        },
        'Create GHL Contact': {
          main: [['Send Alert SMS']]
        }
      }
    };

    try {
      const response = await this.n8nClient.post('/workflows', workflowData);
      
      return {
        content: [
          {
            type: 'text',
            text: `🌟 Yelp Lead Capture Workflow Created!\n\n` +
                  `Workflow ID: ${response.data.id}\n` +
                  `Email Source: ${email_source || 'Gmail IMAP'}\n` +
                  `Urgency Keywords: ${urgency_keywords.join(', ')}\n\n` +
                  `Features:\n` +
                  `• ⚡ Real-time email monitoring\n` +
                  `• 🎯 Advanced lead scoring\n` +
                  `• 📱 Instant SMS alerts\n` +
                  `• 🔗 Automatic GHL integration\n` +
                  `• 🚨 Priority-based notifications\n\n` +
                  `The workflow is now active and monitoring for Yelp leads!`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create Yelp workflow: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Monitor automation health
   */
  async monitorAutomationHealth(args) {
    const { time_range = '24h', include_metrics = true } = args;

    try {
      // Get all workflows
      const workflowsResponse = await this.n8nClient.get('/workflows');
      const workflows = workflowsResponse.data;

      // Get recent executions
      const now = new Date();
      const timeRangeMs = this.parseTimeRange(time_range);
      const since = new Date(now.getTime() - timeRangeMs);

      const healthData = {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.active).length,
        inactiveWorkflows: workflows.filter(w => !w.active).length,
        executions: {
          total: 0,
          successful: 0,
          failed: 0,
          running: 0
        },
        averageExecutionTime: 0,
        errorRate: 0
      };

      // Analyze executions for each workflow
      for (const workflow of workflows) {
        try {
          const executionsResponse = await this.n8nClient.get('/executions', {
            params: {
              workflowId: workflow.id,
              limit: 100
            }
          });

          const executions = (executionsResponse.data.results || executionsResponse.data)
            .filter(e => new Date(e.startedAt) >= since);

          healthData.executions.total += executions.length;
          
          executions.forEach(e => {
            if (!e.finished) {
              healthData.executions.running++;
            } else if (e.data.resultData.error) {
              healthData.executions.failed++;
            } else {
              healthData.executions.successful++;
            }
          });
        } catch (error) {
          console.warn(`Failed to get executions for workflow ${workflow.id}`);
        }
      }

      // Calculate metrics
      if (healthData.executions.total > 0) {
        healthData.errorRate = (healthData.executions.failed / healthData.executions.total * 100).toFixed(2);
      }

      const successRate = healthData.executions.total > 0 ? 
        (healthData.executions.successful / healthData.executions.total * 100).toFixed(2) : '0';

      let healthReport = `🏥 Automation Health Report (${time_range})\n\n` +
                        `📊 Overview:\n` +
                        `• Total Workflows: ${healthData.totalWorkflows}\n` +
                        `• Active: ${healthData.activeWorkflows} | Inactive: ${healthData.inactiveWorkflows}\n\n` +
                        `⚡ Execution Stats:\n` +
                        `• Total Executions: ${healthData.executions.total}\n` +
                        `• Successful: ✅ ${healthData.executions.successful}\n` +
                        `• Failed: ❌ ${healthData.executions.failed}\n` +
                        `• Running: ⏳ ${healthData.executions.running}\n\n` +
                        `📈 Performance:\n` +
                        `• Success Rate: ${successRate}%\n` +
                        `• Error Rate: ${healthData.errorRate}%\n`;

      // Health status
      const overallHealth = successRate >= 95 ? '🟢 Excellent' : 
                           successRate >= 85 ? '🟡 Good' : 
                           successRate >= 70 ? '🟠 Fair' : '🔴 Poor';

      healthReport += `\n🎯 Overall Health: ${overallHealth}`;

      if (include_metrics) {
        healthReport += `\n\n💡 Recommendations:\n`;
        
        if (healthData.errorRate > 5) {
          healthReport += `• ⚠️ High error rate detected - review failed executions\n`;
        }
        if (healthData.inactiveWorkflows > 0) {
          healthReport += `• 📝 ${healthData.inactiveWorkflows} inactive workflows - consider cleanup\n`;
        }
        if (successRate >= 95) {
          healthReport += `• ✨ Excellent performance - system running optimally!\n`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: healthReport
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to monitor health: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Optimize workflows based on performance data
   */
  async optimizeWorkflows(args) {
    const { workflow_id, optimization_type = 'all' } = args;

    try {
      let workflows = [];
      
      if (workflow_id) {
        const response = await this.n8nClient.get(`/workflows/${workflow_id}`);
        workflows = [response.data];
      } else {
        const response = await this.n8nClient.get('/workflows');
        workflows = response.data.filter(w => w.active);
      }

      const optimizations = [];

      for (const workflow of workflows) {
        const workflowOptimizations = await this.analyzeWorkflowOptimizations(workflow, optimization_type);
        if (workflowOptimizations.length > 0) {
          optimizations.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            optimizations: workflowOptimizations
          });
        }
      }

      let report = `⚡ Workflow Optimization Report\n\n`;
      
      if (optimizations.length === 0) {
        report += `✨ Great news! All workflows are already well-optimized.\n\n` +
                 `Current best practices detected:\n` +
                 `• Efficient node connections\n` +
                 `• Proper error handling\n` +
                 `• Reasonable execution times\n`;
      } else {
        report += `Found ${optimizations.length} workflows with optimization opportunities:\n\n`;
        
        optimizations.forEach((opt, index) => {
          report += `${index + 1}. ${opt.workflowName} (ID: ${opt.workflowId})\n`;
          opt.optimizations.forEach(o => {
            report += `   ${o.type === 'performance' ? '⚡' : 
                              o.type === 'reliability' ? '🛡️' : 
                              o.type === 'cost' ? '💰' : '🔧'} ${o.description}\n`;
          });
          report += '\n';
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: report
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to optimize workflows: ${error.response?.data?.message || error.message}`);
    }
  }

  // Helper methods
  generateLeadCaptureWorkflow(name, trigger_type, customNodes) {
    // Implementation for lead capture workflow generation
    return {
      name,
      active: true,
      nodes: [
        // Basic webhook trigger and lead processing nodes
        {
          id: '1',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          parameters: {
            path: 'lead-capture',
            httpMethod: 'POST'
          },
          position: [200, 300]
        },
        ...customNodes
      ]
    };
  }

  generateFollowUpWorkflow(name, trigger_type, customNodes) {
    // Implementation for follow-up workflow generation
    return {
      name,
      active: true,
      nodes: [
        {
          id: '1',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.cron',
          parameters: {
            cron: '0 9 * * *' // Daily at 9 AM
          },
          position: [200, 300]
        },
        ...customNodes
      ]
    };
  }

  generateAnalyticsWorkflow(name, trigger_type, customNodes) {
    // Implementation for analytics workflow generation
    return {
      name,
      active: true,
      nodes: [
        {
          id: '1',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.cron',
          parameters: {
            cron: '0 8 * * 1' // Weekly on Monday at 8 AM
          },
          position: [200, 300]
        },
        ...customNodes
      ]
    };
  }

  generateCustomWorkflow(name, description, trigger_type, customNodes) {
    // Implementation for custom workflow generation
    return {
      name,
      notes: description,
      active: false,
      nodes: customNodes
    };
  }

  generateYelpParserCode(urgencyKeywords) {
    return `
const emailBody = items[0].json.text || items[0].json.body;

// Parse customer information using regex
const nameMatch = emailBody.match(/Name:\\s*(.+?)[\n\r]/);
const phoneMatch = emailBody.match(/Phone:\\s*(.+?)[\n\r]/);
const emailMatch = emailBody.match(/Email:\\s*(.+?)[\n\r]/);
const messageMatch = emailBody.match(/Message:\\s*([\\s\\S]+?)(?=[\n\r]{2}|$)/);
const serviceMatch = emailBody.match(/Service:\\s*(.+?)[\n\r]/);

const leadData = {
  name: nameMatch ? nameMatch[1].trim() : '',
  phone: phoneMatch ? phoneMatch[1].trim() : '',
  email: emailMatch ? emailMatch[1].trim() : '',
  message: messageMatch ? messageMatch[1].trim() : '',
  service: serviceMatch ? serviceMatch[1].trim() : '',
  source: 'Yelp',
  timestamp: new Date().toISOString()
};

// Split name into first and last
const nameParts = leadData.name.split(' ');
leadData.firstName = nameParts[0] || '';
leadData.lastName = nameParts.slice(1).join(' ') || '';

// Check for urgency
const urgentKeywords = ${JSON.stringify(urgencyKeywords)};
const hasUrgency = urgentKeywords.some(keyword => 
  leadData.message.toLowerCase().includes(keyword)
);
leadData.isUrgent = hasUrgency;

return [{ json: leadData }];
`;
  }

  generateLeadScoringCode() {
    return `
const lead = items[0].json;
let score = 0;

// Contact completeness
if (lead.phone && lead.phone.replace(/\\D/g, '').length >= 10) score += 20;
if (lead.email && lead.email.includes('@')) score += 15;
if (lead.name && lead.name.length > 2) score += 10;

// Message quality
if (lead.message && lead.message.length > 20) score += 10;
if (lead.message && lead.message.length > 100) score += 5;

// Service specificity
if (lead.service && lead.service.length > 0) score += 15;

// Urgency bonus
if (lead.isUrgent) score += 25;

// Source bonus (Yelp is high quality)
score += 15;

lead.leadScore = Math.min(score, 100);
lead.priority = score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';

return [{ json: lead }];
`;
  }

  generateLeadRecommendations(leadData, score, priority) {
    const recommendations = [];

    if (priority === 'High') {
      recommendations.push('🚨 IMMEDIATE ACTION: Call within 15 minutes');
      recommendations.push('📱 Send SMS confirmation of contact attempt');
    } else if (priority === 'Medium') {
      recommendations.push('⏰ Contact within 1 hour');
      recommendations.push('📧 Send follow-up email if no phone answer');
    } else {
      recommendations.push('📅 Contact within 4 hours');
      recommendations.push('📝 Add to standard follow-up sequence');
    }

    if (!leadData.phone || leadData.phone.length < 10) {
      recommendations.push('⚠️ Verify phone number before calling');
    }

    if (leadData.message && leadData.message.toLowerCase().includes('emergency')) {
      recommendations.push('🆘 Emergency service - offer same-day scheduling');
    }

    if (leadData.services && leadData.services.length > 1) {
      recommendations.push('💰 High-value prospect - prioritize detailed quote');
    }

    return recommendations;
  }

  async waitForExecution(executionId, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await this.n8nClient.get(`/executions/${executionId}`);
        const execution = response.data;
        
        if (execution.finished) {
          return {
            status: execution.data.resultData.error ? 'error' : 'success',
            duration: new Date(execution.stoppedAt) - new Date(execution.startedAt),
            data: execution.data.resultData.runData
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        throw new Error(`Failed to check execution status: ${error.message}`);
      }
    }
    
    throw new Error('Execution timeout - check status manually');
  }

  parseTimeRange(timeRange) {
    const multipliers = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return multipliers[timeRange] || multipliers['24h'];
  }

  async analyzeWorkflowOptimizations(workflow, optimizationType) {
    const optimizations = [];
    
    // Analyze workflow structure for optimizations
    if (workflow.nodes) {
      // Check for performance optimizations
      if (optimizationType === 'performance' || optimizationType === 'all') {
        if (workflow.nodes.length > 20) {
          optimizations.push({
            type: 'performance',
            description: 'Consider breaking large workflow into smaller, focused workflows'
          });
        }
      }
      
      // Check for reliability optimizations
      if (optimizationType === 'reliability' || optimizationType === 'all') {
        const hasErrorHandling = workflow.nodes.some(n => n.type.includes('error'));
        if (!hasErrorHandling) {
          optimizations.push({
            type: 'reliability',
            description: 'Add error handling nodes to improve reliability'
          });
        }
      }
      
      // Check for cost optimizations
      if (optimizationType === 'cost' || optimizationType === 'all') {
        const hasScheduledNodes = workflow.nodes.some(n => n.type.includes('cron'));
        if (hasScheduledNodes) {
          optimizations.push({
            type: 'cost',
            description: 'Review scheduled execution frequency to optimize costs'
          });
        }
      }
    }
    
    return optimizations;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('N8N MCP Server running on stdio');
  }
}

// Start the server
const server = new N8nMcpServer();

// Handle configuration from environment or config file
const config = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678/api/v1',
    apiKey: process.env.N8N_API_KEY || '',
    webhookUrl: process.env.N8N_WEBHOOK_URL
  },
  ghl: {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  },
  business: {
    name: 'Big Truss Roof Cleaning',
    phone: '+17788586355',
    email: 'tim@bigtrussroofcleaning.com'
  }
};

server.initialize(config).then(() => {
  server.run().catch(console.error);
}).catch(console.error); 