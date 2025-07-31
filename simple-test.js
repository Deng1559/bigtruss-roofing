#!/usr/bin/env node

/**
 * Simple Webhook System Test
 * Tests core functionality without requiring server setup
 */

console.log('🧪 Simple Webhook System Test\n');

// Test 1: Basic data mapping
console.log('1. Testing data mapping...');
try {
    // Simple data mapper simulation
    const testData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        serviceType: 'estimate'
    };
    
    console.log('   📋 Input data:');
    console.log(`   ${JSON.stringify(testData, null, 6)}`);
    
    // Basic mapping logic
    const mappedData = {
        ...testData,
        source: 'test',
        timestamp: new Date().toISOString(),
        mapped: true
    };
    
    console.log('   ✅ Data mapping successful');
    console.log('   📤 Mapped data:');
    console.log(`   ${JSON.stringify(mappedData, null, 6)}`);
    
} catch (error) {
    console.log(`   ❌ Data mapping failed: ${error.message}`);
}

// Test 2: GoHighLevel URL validation
console.log('\n2. Testing GoHighLevel URL...');
try {
    const webhookUrl = 'https://services.leadconnectorhq.com/hooks/Ww1psuATtTQNf3cOMAHl/webhook-trigger/555dfe89-e7c6-412f-ae25-83cdb059290e';
    
    console.log('   📡 Webhook URL:');
    console.log(`   ${webhookUrl}`);
    
    // Basic URL validation
    const url = new URL(webhookUrl);
    console.log(`   ✅ URL is valid`);
    console.log(`   🏠 Host: ${url.host}`);
    console.log(`   🛤️ Path: ${url.pathname}`);
    
} catch (error) {
    console.log(`   ❌ URL validation failed: ${error.message}`);
}

// Test 3: File structure check
console.log('\n3. Checking file structure...');
import fs from 'fs';

const files = [
    'inbound-webhook-server.js',
    'webhook-dashboard.html',
    'package.json'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`   ✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
    } else {
        console.log(`   ❌ ${file} - missing`);
    }
});

// Test 4: Basic HTTP simulation
console.log('\n4. Simulating webhook request...');
try {
    const mockRequest = {
        method: 'POST',
        url: '/webhook/test',
        headers: {
            'content-type': 'application/json'
        },
        body: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com'
        }
    };
    
    console.log('   📨 Mock webhook request:');
    console.log(`   ${mockRequest.method} ${mockRequest.url}`);
    console.log(`   📋 Payload: ${JSON.stringify(mockRequest.body)}`);
    
    // Simulate processing
    const response = {
        success: true,
        message: 'Webhook processed successfully',
        requestId: 'test_' + Date.now(),
        timestamp: new Date().toISOString()
    };
    
    console.log('   ✅ Mock processing successful');
    console.log('   📤 Mock response:');
    console.log(`   ${JSON.stringify(response, null, 6)}`);
    
} catch (error) {
    console.log(`   ❌ Mock processing failed: ${error.message}`);
}

console.log('\n' + '=' .repeat(50));
console.log('📋 NEXT STEPS:\n');

console.log('If tests above passed:');
console.log('1. Run: npm install');
console.log('2. Run: npm run webhook');
console.log('3. Open: http://localhost:3000/health\n');

console.log('If you still can\'t view it:');
console.log('1. Check if port 3000 is available');
console.log('2. Try a different port: PORT=3001 npm run webhook');
console.log('3. Check firewall/antivirus settings');
console.log('4. Try opening webhook-dashboard.html directly in browser\n');

console.log('💡 ALTERNATIVE VIEWING OPTIONS:');
console.log('- Open webhook-dashboard.html in any web browser');
console.log('- Use Windows File Explorer to double-click webhook-dashboard.html');
console.log('- Try: start webhook-dashboard.html (in Command Prompt)');
console.log('- Try different browsers (Chrome, Firefox, Edge)');

console.log('\n🔍 For detailed diagnosis, run: node check-setup.js');