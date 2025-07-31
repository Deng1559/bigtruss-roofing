#!/usr/bin/env node

/**
 * Webhook Setup Diagnostic Tool
 * Checks if everything is properly configured and provides troubleshooting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 BigTruss Webhook Setup Diagnostic\n');
console.log('=' .repeat(50));

// Check 1: Node.js version
console.log('\n1. ✅ Checking Node.js version...');
console.log(`   Node.js version: ${process.version}`);
if (parseInt(process.version.slice(1)) < 18) {
    console.log('   ⚠️ WARNING: Node.js 18+ recommended');
} else {
    console.log('   ✅ Node.js version is compatible');
}

// Check 2: Required files
console.log('\n2. 📁 Checking required files...');
const requiredFiles = [
    'package.json',
    'inbound-webhook-server.js',
    'webhook-test.js',
    'test-ghl-webhook.js',
    'webhook-dashboard.html',
    'gohighlevel-webhook-integration.js',
    'webhook-data-mapper.js', 
    'webhook-error-handler.js'
];

let missingFiles = [];
requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
        missingFiles.push(file);
    }
});

// Check 3: Package.json and dependencies
console.log('\n3. 📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log(`   ✅ Package name: ${packageJson.name}`);
    console.log(`   ✅ Version: ${packageJson.version}`);
    
    const requiredDeps = ['express', 'cors', 'helmet', 'express-rate-limit'];
    console.log('\n   📋 Required dependencies:');
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`   ❌ ${dep} - MISSING from dependencies`);
        }
    });
    
    console.log('\n   🎯 Available scripts:');
    Object.keys(packageJson.scripts || {}).forEach(script => {
        console.log(`   - npm run ${script}`);
    });
    
} catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Check 4: node_modules
console.log('\n4. 📚 Checking node_modules...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('   ✅ node_modules directory exists');
    
    // Check specific modules
    const requiredModules = ['express', 'cors', 'helmet'];
    requiredModules.forEach(mod => {
        if (fs.existsSync(path.join(__dirname, 'node_modules', mod))) {
            console.log(`   ✅ ${mod} installed`);
        } else {
            console.log(`   ❌ ${mod} not installed`);
        }
    });
} else {
    console.log('   ❌ node_modules directory missing');
    console.log('   💡 Run: npm install');
}

// Check 5: Port availability
console.log('\n5. 🔌 Checking port 3000...');
import { createServer } from 'http';

const testServer = createServer();
testServer.listen(3000, 'localhost', () => {
    console.log('   ✅ Port 3000 is available');
    testServer.close();
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('   ⚠️ Port 3000 is already in use');
        console.log('   💡 Something might already be running on port 3000');
        console.log('   💡 Try: netstat -ano | findstr :3000');
    } else {
        console.log(`   ❌ Port check error: ${err.message}`);
    }
});

// Check 6: Try importing webhook server
console.log('\n6. 🔧 Testing webhook server import...');
try {
    const serverModule = await import('./inbound-webhook-server.js');
    console.log('   ✅ Webhook server module loads successfully');
} catch (error) {
    console.log(`   ❌ Error loading webhook server: ${error.message}`);
    if (error.message.includes('Cannot resolve module')) {
        console.log('   💡 Missing dependencies - run: npm install');
    }
}

// Provide recommendations
console.log('\n' + '=' .repeat(50));
console.log('🎯 RECOMMENDATIONS:\n');

if (missingFiles.length > 0) {
    console.log('❌ MISSING FILES:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('   💡 Some webhook files are missing. Please ensure all files were created.\n');
}

console.log('📋 SETUP STEPS:');
console.log('1. Install dependencies:');
console.log('   npm install\n');

console.log('2. Start the webhook server:');
console.log('   npm run webhook\n');

console.log('3. View in browser:');
console.log('   - Open: webhook-dashboard.html');
console.log('   - Or visit: http://localhost:3000/health\n');

console.log('4. Test the system:');
console.log('   npm run webhook:test:ghl\n');

console.log('🔍 TROUBLESHOOTING:');
console.log('- If "npm install" fails: Check internet connection');
console.log('- If port 3000 busy: Kill other processes or use different port');
console.log('- If modules missing: Delete node_modules and run npm install again');
console.log('- If import errors: Check Node.js version (need 18+)');

console.log('\n✨ Run this diagnostic anytime with: node check-setup.js');