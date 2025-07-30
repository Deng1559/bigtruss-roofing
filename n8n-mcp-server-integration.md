# N8n MCP Server Integration for Big Truss Roof Cleaning - SuperClaude

## 🎯 Overview
This guide integrates n8n as an MCP (Model Context Protocol) server with SuperClaude, enabling direct AI interaction with your existing n8n workflows for lead processing, Yelp integration, and business automation.

## 🚀 Benefits of N8n MCP Integration

### For Big Truss Roof Cleaning:
- **AI-Driven Lead Management**: SuperClaude can directly trigger lead processing workflows
- **Intelligent Yelp Integration**: AI can analyze and route Yelp leads automatically  
- **Dynamic Workflow Control**: Start/stop/modify workflows based on business conditions
- **Real-time Data Access**: Query workflow results and business metrics via AI
- **Automated Decision Making**: AI can choose appropriate workflows based on lead types

---

## 📋 Implementation Steps

### Phase 1: N8n MCP Server Setup

#### Step 1: Install N8n MCP Community Node
```bash
# Option 1: Via n8n UI (Recommended)
# Go to Settings → Community Nodes → Install
# Package: n8n-nodes-mcp-client

# Option 2: Manual installation
npm install n8n-nodes-mcp-client
```

#### Step 2: Configure N8n as MCP Server
```bash
# Install n8n MCP server trigger node
npm install -g @n8n/mcp-server
```

#### Step 3: Enable Community Nodes as Tools
Add to your n8n environment variables:
```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

**For Docker (docker-compose.yml):**
```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
      - N8N_MCP_SERVER_ENABLED=true
      - N8N_MCP_SERVER_PORT=3001
    ports:
      - "5678:5678"
      - "3001:3001"  # MCP Server port
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### Phase 2: SuperClaude MCP Configuration

#### Step 1: Update SuperClaude MCP Settings
```bash
# Add n8n MCP server to SuperClaude configuration
python -m SuperClaude install --profile developer
```

#### Step 2: Configure Claude Desktop for N8n MCP
Update your Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n8n-big-truss": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3001/sse",
        "--header",
        "Authorization: Bearer ${N8N_MCP_TOKEN}"
      ],
      "env": {
        "N8N_MCP_TOKEN": "your-n8n-mcp-token-here"
      }
    }
  }
}
```

---

## 🔧 N8n Workflow Templates for MCP Integration

### 1. **MCP Lead Processing Workflow**

#### Workflow: `mcp-yelp-lead-processor`
```json
{
  "name": "MCP Yelp Lead Processor",
  "nodes": [
    {
      "name": "MCP Server Trigger",
      "type": "@n8n/trigger-mcp-server",
      "parameters": {
        "path": "/leads/yelp",
        "authentication": "bearer",
        "methods": ["POST"]
      }
    },
    {
      "name": "Parse Lead Data", 
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
// Extract lead information from MCP request
const leadData = items[0].json;

return [{
  json: {
    customerName: leadData.name || '',
    customerPhone: leadData.phone || '',
    customerEmail: leadData.email || '',
    serviceType: leadData.service || 'Roof Cleaning',
    message: leadData.message || '',
    source: 'Yelp-MCP',
    urgency: leadData.urgency || 'High',
    timestamp: new Date().toISOString()
  }
}];
`
      }
    },
    {
      "name": "Create GHL Contact",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://services.leadconnectorhq.com/contacts/",
        "method": "POST",
        "body": {
          "firstName": "={{$json.customerName.split(' ')[0]}}",
          "lastName": "={{$json.customerName.split(' ').slice(1).join(' ')}}",
          "phone": "={{$json.customerPhone}}",
          "email": "={{$json.customerEmail}}",
          "source": "Yelp-MCP",
          "tags": ["Yelp Lead", "MCP Generated", "Hot Lead"]
        }
      }
    },
    {
      "name": "SMS Alert to Tim",
      "type": "n8n-nodes-base.httpRequest", 
      "parameters": {
        "url": "https://services.leadconnectorhq.com/conversations/messages",
        "method": "POST",
        "body": {
          "type": "SMS",
          "contactId": "tim_contact_id",
          "message": "🤖 AI-PROCESSED YELP LEAD!\n\nName: {{$json.customerName}}\nPhone: {{$json.customerPhone}}\nService: {{$json.serviceType}}\n\nProcessed via SuperClaude MCP!"
        }
      }
    }
  ]
}
```

### 2. **MCP Business Intelligence Workflow**

#### Workflow: `mcp-business-metrics`
```json
{
  "name": "MCP Business Metrics",
  "nodes": [
    {
      "name": "MCP Server Trigger",
      "type": "@n8n/trigger-mcp-server", 
      "parameters": {
        "path": "/metrics/dashboard",
        "authentication": "bearer",
        "methods": ["GET"]
      }
    },
    {
      "name": "Query Lead Metrics",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
// Simulate business metrics query
// In production, connect to your actual CRM/database

const metrics = {
  today: {
    leads: 12,
    yelp_leads: 5,
    conversions: 3,
    revenue: 1500
  },
  this_week: {
    leads: 47,
    yelp_leads: 18,
    conversions: 14,
    revenue: 7200
  },
  response_times: {
    average: "4 minutes",
    yelp_average: "2 minutes", 
    target: "5 minutes"
  },
  top_services: [
    "Roof Cleaning",
    "Gutter Cleaning", 
    "Pressure Washing"
  ]
};

return [{ json: metrics }];
`
      }
    }
  ]
}
```

### 3. **MCP Workflow Control**

#### Workflow: `mcp-workflow-controller`
```json
{
  "name": "MCP Workflow Controller",
  "nodes": [
    {
      "name": "MCP Server Trigger",
      "type": "@n8n/trigger-mcp-server",
      "parameters": {
        "path": "/control/:action/:workflow",
        "authentication": "bearer",
        "methods": ["POST"]
      }
    },
    {
      "name": "Route Action",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.action}}",
              "operation": "equal",
              "value2": "start"
            },
            {
              "value1": "={{$json.action}}", 
              "operation": "equal",
              "value2": "stop"
            },
            {
              "value1": "={{$json.action}}",
              "operation": "equal", 
              "value2": "status"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🤖 SuperClaude Commands for N8n Integration

### Custom SuperClaude Commands

#### `/sc:n8n-lead` - Process Lead via N8n
```javascript
// Add to SuperClaude commands
const processLead = async (leadData) => {
  const response = await fetch('http://localhost:3001/mcp/leads/yelp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.N8N_MCP_TOKEN
    },
    body: JSON.stringify(leadData)
  });
  
  return response.json();
};
```

#### `/sc:n8n-metrics` - Get Business Metrics
```javascript
const getMetrics = async () => {
  const response = await fetch('http://localhost:3001/mcp/metrics/dashboard', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + process.env.N8N_MCP_TOKEN
    }
  });
  
  return response.json();
};
```

#### `/sc:n8n-workflow` - Control Workflows
```javascript
const controlWorkflow = async (action, workflowName) => {
  const response = await fetch(`http://localhost:3001/mcp/control/${action}/${workflowName}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.N8N_MCP_TOKEN
    }
  });
  
  return response.json();
};
```

---

## 🔗 Integration with Existing Big Truss Workflows

### Enhanced Yelp Integration
```mermaid
graph LR
    A[Yelp Email] --> B[SuperClaude Analysis]
    B --> C[AI Lead Scoring]
    C --> D[N8n MCP Trigger]
    D --> E[GoHighLevel Contact]
    E --> F[Tim SMS Alert]
    F --> G[Customer Auto-Response]
```

### AI-Powered Decision Flow
```javascript
// SuperClaude can intelligently route leads based on analysis
const routeLead = async (leadData) => {
  // AI analyzes lead quality and urgency
  const analysis = await analyzeLead(leadData);
  
  if (analysis.urgency === 'HIGH') {
    // Trigger immediate processing workflow
    await processLead(leadData, 'urgent-lead-processor');
  } else {
    // Use standard processing workflow  
    await processLead(leadData, 'standard-lead-processor');
  }
};
```

---

## 🛠️ Implementation Checklist

### Week 1: Foundation Setup
- [ ] Install n8n MCP community node
- [ ] Configure n8n as MCP server (port 3001)
- [ ] Set up environment variables
- [ ] Update SuperClaude configuration
- [ ] Test basic MCP connection

### Week 2: Workflow Integration
- [ ] Create MCP lead processing workflow
- [ ] Set up business metrics workflow
- [ ] Configure workflow control endpoints
- [ ] Test workflows via MCP calls
- [ ] Integrate with existing Yelp automation

### Week 3: SuperClaude Commands
- [ ] Add custom SuperClaude commands
- [ ] Configure AI-powered lead routing
- [ ] Set up automated decision making
- [ ] Test end-to-end AI → N8n → GHL flow
- [ ] Train Tim on new AI capabilities

### Week 4: Advanced Features
- [ ] Implement weather-based lead routing
- [ ] Add competitor analysis workflows
- [ ] Set up automated reporting
- [ ] Configure emergency escalation
- [ ] Performance optimization

---

## 📊 Expected Results

### Immediate Benefits (Week 1-2):
- **AI-Powered Lead Processing**: SuperClaude can directly process leads
- **Intelligent Workflow Triggering**: AI chooses optimal processing paths
- **Real-time Business Insights**: Query metrics via natural language

### Advanced Capabilities (Week 3-4):
- **Conversational Workflow Management**: "Start the emergency lead processor"
- **Predictive Lead Scoring**: AI predicts lead conversion probability
- **Automated Business Decisions**: AI can pause/resume workflows based on conditions

### Long-term Impact:
- **60% Reduction** in manual workflow management
- **80% Faster** lead routing and processing  
- **Advanced AI Integration** with existing business processes
- **Scalable Automation** that adapts to business needs

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. **MCP Connection Failed**
```bash
# Check if n8n MCP server is running
curl http://localhost:3001/sse

# Verify environment variables
echo $N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE
```

#### 2. **SuperClaude Can't Connect**
```bash
# Test MCP endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/mcp/metrics/dashboard
```

#### 3. **Workflow Not Triggering**
- Verify MCP Server Trigger node configuration
- Check authentication tokens
- Ensure workflow is activated

---

## 🚀 Next Steps

1. **Install MCP Components** - Get the foundation running
2. **Create Test Workflows** - Start with simple lead processing
3. **Configure SuperClaude** - Add MCP server to configuration
4. **Test Integration** - Verify AI can trigger workflows
5. **Enhance Existing Automation** - Integrate with Yelp workflows
6. **Scale Advanced Features** - Add intelligent routing and analytics

This integration transforms your n8n automation from static workflows into dynamic, AI-controlled business processes that adapt in real-time to lead quality, business conditions, and customer needs! 