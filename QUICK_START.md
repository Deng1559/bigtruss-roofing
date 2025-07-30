# 🚀 Quick Start Guide - N8N MCP Server

## 5-Minute Setup for Big Truss Roof Cleaning

This guide gets your N8N MCP Server running in under 5 minutes.

### Prerequisites ✅

- Node.js 18+ installed
- N8N instance running (get API key ready)
- GoHighLevel account (get API key ready)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Setup Wizard

```bash
npm run setup
```

**What you'll need:**
- N8N Base URL (e.g., `http://localhost:5678/api/v1`)
- N8N API Key (from your n8n settings)
- GoHighLevel API Key
- GoHighLevel Location ID
- Business contact info (defaults provided)

### Step 3: Test Installation

```bash
npm test
```

### Step 4: Start Server

```bash
npm start
```

## 🎯 First Workflow: Yelp Lead Capture

Once your MCP server is running and connected to your AI assistant:

1. **Create Yelp Workflow:**
   ```
   AI: "Create a Yelp lead capture workflow"
   ```

2. **Test Lead Analysis:**
   ```
   AI: "Analyze this lead: John Smith, +1234567890, john@email.com, roof cleaning needed urgently"
   ```

3. **Monitor Health:**
   ```
   AI: "Check automation health"
   ```

## 🔗 Connect to AI Assistant

Add to your AI client's MCP configuration:

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

## 🌟 Available Commands

| Command | Description |
|---------|-------------|
| `list_workflows` | Show all n8n workflows |
| `create_yelp_workflow` | Set up Yelp lead capture |
| `analyze_lead_data` | Score and analyze leads |
| `monitor_automation_health` | Check system health |
| `execute_workflow` | Run a specific workflow |

## 🆘 Troubleshooting

**MCP Server won't start?**
- Check `.env` file exists
- Verify API keys are correct
- Ensure n8n is running

**Can't connect to n8n?**
- Test n8n URL in browser
- Check API key permissions
- Verify firewall settings

**No workflows showing?**
- Create a test workflow in n8n first
- Check API key has read permissions

## 📞 Support

- **Email:** tim@bigtrussroofcleaning.com
- **Docs:** README-N8N-MCP.md
- **Tests:** `npm test`

---

**That's it! Your intelligent automation is now active.** 🎉

Your n8n MCP server will help you:
- ✅ Capture every lead automatically
- 🎯 Score leads with AI intelligence  
- 📊 Monitor automation health
- ⚡ Optimize workflows continuously
- 🌟 Never miss a Yelp inquiry again

**Ready to transform your roof cleaning business!** 🚀 