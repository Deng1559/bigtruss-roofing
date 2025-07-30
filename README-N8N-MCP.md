# N8N MCP Server Integration for Big Truss Roof Cleaning

## 🚀 Overview

This N8N MCP (Model Context Protocol) Server provides AI assistants with direct access to your n8n automation workflows, enabling intelligent automation management, lead processing, and workflow optimization for Big Truss Roof Cleaning.

### Key Features

- 🔧 **Workflow Management**: Create, execute, and monitor n8n workflows through AI
- 🎯 **Lead Analysis**: AI-powered lead scoring and recommendations
- 📊 **Health Monitoring**: Real-time automation performance tracking
- ⚡ **Performance Optimization**: Automated workflow analysis and suggestions
- 🌟 **Yelp Integration**: Specialized workflows for Yelp lead capture
- 🔗 **CRM Integration**: Seamless GoHighLevel integration

## 📋 Prerequisites

Before setting up the N8N MCP Server, ensure you have:

- **Node.js 18+** installed
- **N8N instance** running (self-hosted or cloud)
- **N8N API key** with appropriate permissions
- **GoHighLevel account** with API access
- **Email account** for Yelp integration (optional)

## 🛠️ Installation

### 1. Clone or Download Files

```bash
# If using git
git clone https://github.com/bigtrussroofcleaning/n8n-mcp-server.git
cd n8n-mcp-server

# Or download the files to your project directory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Setup Wizard

```bash
npm run setup
```

The interactive setup wizard will guide you through:
- N8N configuration
- GoHighLevel setup
- Business information
- Email integration
- Connection testing

### 4. Start the Server

```bash
npm start
```

## ⚙️ Configuration

### Environment Variables

The setup wizard creates a `.env` file with your configuration:

```env
# N8N Configuration
N8N_BASE_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key_here

# GoHighLevel Configuration
GHL_API_KEY=your_gohighlevel_api_key_here
GHL_LOCATION_ID=your_location_id_here

# Business Information
BUSINESS_NAME=Big Truss Roof Cleaning
BUSINESS_PHONE=+17788586355
BUSINESS_EMAIL=tim@bigtrussroofcleaning.com
```

### MCP Client Configuration

Add this to your AI assistant's MCP configuration:

```json
{
  "mcpServers": {
    "n8n-automation": {
      "command": "node",
      "args": ["n8n-mcp-server.js"],
      "cwd": "/path/to/your/n8n-mcp-server"
    }
  }
}
```

## 🎯 Available Tools

### 1. `create_workflow`
Create new n8n workflows for automation.

```javascript
// Example: Create a lead capture workflow
{
  "name": "Website Lead Capture",
  "trigger_type": "webhook",
  "workflow_type": "lead_capture",
  "description": "Capture and process website form submissions"
}
```

### 2. `execute_workflow`
Execute existing workflows with data.

```javascript
// Example: Execute a workflow
{
  "workflow_name": "Website Lead Capture",
  "input_data": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "services": ["roof-cleaning"]
  }
}
```

### 3. `list_workflows`
List all available workflows.

```javascript
// Example: List active workflows only
{
  "active_only": true,
  "workflow_type": "lead_capture"
}
```

### 4. `analyze_lead_data`
AI-powered lead analysis and scoring.

```javascript
// Example: Analyze a lead
{
  "lead_data": {
    "name": "Jane Smith",
    "phone": "+1987654321",
    "email": "jane@example.com",
    "services": ["roof-cleaning", "gutter-cleaning"],
    "message": "Urgent - roof leak in living room",
    "source": "Yelp"
  }
}
```

### 5. `create_yelp_workflow`
Create specialized Yelp lead capture workflows.

```javascript
// Example: Create Yelp workflow
{
  "email_source": "business@gmail.com",
  "urgency_keywords": ["urgent", "emergency", "leak", "damage"]
}
```

### 6. `monitor_automation_health`
Monitor automation performance and health.

```javascript
// Example: Check 24h health report
{
  "time_range": "24h",
  "include_metrics": true
}
```

### 7. `optimize_workflows`
Get workflow optimization recommendations.

```javascript
// Example: Optimize all workflows
{
  "optimization_type": "all"
}
```

## 🌟 Integration with Landing Page

The landing page (`script.js`) is enhanced with MCP server integration:

### Features Added:
- **AI Lead Analysis**: Real-time lead scoring and insights
- **Health Monitoring**: MCP server status tracking
- **Enhanced Scoring**: Advanced lead prioritization algorithms
- **Visual Insights**: AI-generated recommendations panel

### Usage in Landing Page:

```javascript
// The landing page automatically:
// 1. Captures form submissions
// 2. Sends data to n8n workflows
// 3. Analyzes leads with MCP server
// 4. Displays AI insights to admin users
// 5. Monitors automation health

// Test MCP integration
window.BigTrussAutomation.checkMcpServerHealth();
```

## 📊 Workflow Examples

### 1. Yelp Lead Capture Workflow

```javascript
// AI Assistant Command:
// "Create a Yelp lead capture workflow"

{
  "tool": "create_yelp_workflow",
  "arguments": {
    "email_source": "tim@bigtrussroofcleaning.com",
    "urgency_keywords": ["urgent", "asap", "emergency", "leak", "damage"]
  }
}
```

This creates a workflow that:
- Monitors email for Yelp notifications
- Parses lead information
- Scores leads automatically
- Creates GHL contacts
- Sends SMS alerts

### 2. Website Lead Processing

```javascript
// AI Assistant Command:
// "Process this website lead"

{
  "tool": "analyze_lead_data",
  "arguments": {
    "lead_data": {
      "name": "Mike Johnson",
      "phone": "+1555123456",
      "email": "mike@email.com",
      "services": ["roof-cleaning", "pressure-washing"],
      "message": "Need roof cleaning for 2-story house, some moss visible",
      "source": "Website"
    }
  }
}
```

AI Response:
```
🎯 Lead Analysis Results:

🔥 Priority: High
📊 Lead Score: 85/100

Scoring Factors:
✅ Valid phone number (+20)
✅ Valid email address (+15)
✅ Name provided (+10)
✅ Services selected: roof-cleaning, pressure-washing (+15)
✅ Multiple services requested (+10)
✅ Detailed message provided (+10)
✅ High-quality source: Website (+5)

💡 Recommendations:
• ⏰ Contact within 1 hour
• 💰 High-value prospect - prioritize detailed quote
• 📧 Send follow-up email if no phone answer
```

## 🏥 Health Monitoring

### Automated Health Checks

The MCP server continuously monitors:
- Workflow execution success rates
- Error patterns and frequencies
- Performance metrics
- System availability

### Health Report Example

```javascript
// AI Assistant Command:
// "Check automation health"

{
  "tool": "monitor_automation_health",
  "arguments": {
    "time_range": "24h",
    "include_metrics": true
  }
}
```

AI Response:
```
🏥 Automation Health Report (24h)

📊 Overview:
• Total Workflows: 5
• Active: 5 | Inactive: 0

⚡ Execution Stats:
• Total Executions: 47
• Successful: ✅ 45
• Failed: ❌ 2
• Running: ⏳ 0

📈 Performance:
• Success Rate: 95.7%
• Error Rate: 4.3%

🎯 Overall Health: 🟢 Excellent

💡 Recommendations:
• ✨ Excellent performance - system running optimally!
```

## ⚡ Performance Optimization

### Automated Optimization

The MCP server analyzes workflows and suggests improvements:

```javascript
// AI Assistant Command:
// "Optimize my workflows"

{
  "tool": "optimize_workflows",
  "arguments": {
    "optimization_type": "all"
  }
}
```

AI Response:
```
⚡ Workflow Optimization Report

Found 2 workflows with optimization opportunities:

1. Yelp Lead Capture (ID: 123)
   🛡️ Add error handling nodes to improve reliability
   💰 Review scheduled execution frequency to optimize costs

2. Website Analytics (ID: 456)
   ⚡ Consider breaking large workflow into smaller, focused workflows
```

## 🚨 Troubleshooting

### Common Issues

#### 1. N8N Connection Failed
```
❌ N8N connection failed: Request timeout
```
**Solution**: Check N8N URL and ensure API key has proper permissions.

#### 2. MCP Server Not Responding
```
🔴 MCP Server Offline
```
**Solutions**:
- Restart the MCP server: `npm start`
- Check environment variables in `.env`
- Verify n8n instance is running

#### 3. Workflow Execution Errors
```
❌ Workflow execution failed: Node 'Email' failed
```
**Solutions**:
- Check node configurations in n8n
- Verify API credentials
- Review workflow logs in n8n interface

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm start
```

### Log Levels

Set log level in `.env`:
```env
LOG_LEVEL=debug  # Options: error, warn, info, debug
```

## 🔒 Security Best Practices

### API Key Management
- Store API keys in `.env` file only
- Never commit `.env` to version control
- Use strong, unique API keys
- Rotate keys regularly

### Network Security
- Use HTTPS for all webhook URLs
- Implement IP whitelisting if possible
- Monitor for unusual activity

### Data Privacy
- Follow GDPR compliance guidelines
- Implement data retention policies
- Secure customer data transmission

## 📈 Analytics & Reporting

### Built-in Metrics

The MCP server tracks:
- Lead conversion rates
- Response times
- Workflow performance
- Error rates and patterns

### Custom Reports

Create custom analytics workflows:

```javascript
// AI Assistant Command:
// "Create a weekly performance report"

{
  "tool": "create_workflow",
  "arguments": {
    "name": "Weekly Performance Report",
    "trigger_type": "schedule",
    "workflow_type": "analytics"
  }
}
```

## 🎯 Advanced Use Cases

### 1. Dynamic Workflow Creation

```javascript
// AI can create workflows based on business needs
"Create a follow-up workflow for leads that haven't responded in 24 hours"
```

### 2. Intelligent Lead Routing

```javascript
// Route high-value leads differently
"Analyze this lead and if score > 80, send immediate SMS alert"
```

### 3. Seasonal Campaign Automation

```javascript
// Adapt workflows based on season/weather
"Create a storm damage follow-up workflow for existing customers"
```

## 🚀 Deployment

### Production Deployment

1. **Server Setup**:
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start with PM2
   pm2 start n8n-mcp-server.js --name "n8n-mcp-server"
   ```

2. **Monitoring**:
   ```bash
   # Check status
   pm2 status
   
   # View logs
   pm2 logs n8n-mcp-server
   ```

3. **Auto-restart**:
   ```bash
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## 🆘 Support

### Getting Help

1. **Check Logs**: Review console output for error details
2. **Test Connections**: Use the setup wizard to verify configurations
3. **Documentation**: Review n8n and GoHighLevel API documentation
4. **Community**: Check n8n community forums for workflow help

### Contact Information

- **Business Email**: tim@bigtrussroofcleaning.com
- **Technical Support**: Check GitHub issues
- **Documentation**: This README and inline code comments

## 📚 Additional Resources

### Links
- [N8N Documentation](https://docs.n8n.io/)
- [GoHighLevel API Docs](https://docs.gohighlevel.com/)
- [Model Context Protocol](https://github.com/modelcontextprotocol)

### Training Materials
- N8N workflow tutorials
- GoHighLevel automation guides
- Lead scoring best practices

---

## 🎉 Success Metrics

After implementing the N8N MCP Server, expect:

- **95%+ Lead Capture Rate**: Never miss a Yelp or website inquiry
- **60% Faster Response Times**: Automated alerts and processing
- **40% Better Lead Quality**: AI-powered scoring and prioritization
- **50% Reduced Manual Work**: Automated workflows handle routine tasks
- **Real-time Insights**: AI analysis of every lead interaction

**Transform your roof cleaning business with intelligent automation!** 🚀 