#!/usr/bin/env node

/**
 * Whop Authentication Testing Script
 * Tests Whop integration and authentication flows
 */

const https = require('https');
const http = require('http');

class WhopAuthTester {
  constructor(appUrl = 'http://localhost:3000', credentials = {}) {
    this.appUrl = appUrl;
    this.credentials = {
      appId: credentials.appId || process.env.NEXT_PUBLIC_WHOP_APP_ID,
      apiKey: credentials.apiKey || process.env.WHOP_API_KEY,
      agentUserId: credentials.agentUserId || process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
      companyId: credentials.companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID
    };
    this.testResults = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runTests() {
    console.log('🔐 Starting Whop Authentication Tests...\n');

    await this.testCredentialsConfiguration();
    await this.testAppAccessibility();
    await this.testAPIEndpoints();
    await this.testWhopSDKIntegration();
    await this.testUserAuthentication();
    await this.testExperienceAccess();

    return this.generateReport();
  }

  async testCredentialsConfiguration() {
    console.log('🔍 Testing credentials configuration...');

    const requiredCreds = ['appId', 'apiKey', 'agentUserId', 'companyId'];
    
    for (const cred of requiredCreds) {
      if (!this.credentials[cred] || this.credentials[cred] === 'fallback') {
        this.testResults.failed.push({
          test: 'Credentials Configuration',
          issue: `Missing or invalid ${cred}`,
          expected: 'Valid credential value',
          actual: this.credentials[cred] || 'undefined',
          remediation: `Set ${cred} in environment variables`
        });
      } else {
        this.testResults.passed.push({
          test: 'Credentials Configuration',
          description: `${cred} is properly configured`
        });
      }
    }

    // Validate credential formats
    if (this.credentials.appId && !this.credentials.appId.startsWith('app_')) {
      this.testResults.warnings.push({
        test: 'Credentials Format',
        issue: 'App ID format may be incorrect',
        expected: 'Should start with "app_"',
        actual: this.credentials.appId
      });
    }

    if (this.credentials.agentUserId && !this.credentials.agentUserId.startsWith('user_')) {
      this.testResults.warnings.push({
        test: 'Credentials Format',
        issue: 'Agent User ID format may be incorrect',
        expected: 'Should start with "user_"',
        actual: this.credentials.agentUserId
      });
    }

    if (this.credentials.companyId && !this.credentials.companyId.startsWith('biz_')) {
      this.testResults.warnings.push({
        test: 'Credentials Format',
        issue: 'Company ID format may be incorrect',
        expected: 'Should start with "biz_"',
        actual: this.credentials.companyId
      });
    }
  }

  async testAppAccessibility() {
    console.log('🔍 Testing app accessibility...');

    try {
      const response = await this.makeRequest('/', 'GET');
      
      if (response.statusCode === 200) {
        this.testResults.passed.push({
          test: 'App Accessibility',
          description: 'Main application is accessible'
        });
      } else {
        this.testResults.failed.push({
          test: 'App Accessibility',
          issue: 'Main application not accessible',
          expected: 'Status 200',
          actual: `Status ${response.statusCode}`,
          remediation: 'Check deployment and server configuration'
        });
      }

      // Test experience page
      const expResponse = await this.makeRequest('/experiences/test', 'GET');
      if (expResponse.statusCode === 200) {
        this.testResults.passed.push({
          test: 'Experience Page Access',
          description: 'Experience page is accessible'
        });
      } else {
        this.testResults.failed.push({
          test: 'Experience Page Access',
          issue: 'Experience page not accessible',
          expected: 'Status 200',
          actual: `Status ${expResponse.statusCode}`
        });
      }

    } catch (error) {
      this.testResults.failed.push({
        test: 'App Accessibility',
        issue: 'Failed to connect to application',
        error: error.message,
        remediation: 'Verify application URL and deployment status'
      });
    }
  }

  async testAPIEndpoints() {
    console.log('🔍 Testing API endpoints...');

    const endpoints = [
      { path: '/api/user', method: 'GET' },
      { path: '/api/generate', method: 'POST', body: { userInput: 'test', sessionId: 'test-session' } },
      { path: '/api/sessions', method: 'GET' },
      { path: '/api/messages', method: 'GET', query: '?sessionId=test' }
    ];

    for (const endpoint of endpoints) {
      try {
        const url = endpoint.path + (endpoint.query || '');
        const response = await this.makeRequest(url, endpoint.method, endpoint.body);
        
        if (response.statusCode >= 200 && response.statusCode < 500) {
          this.testResults.passed.push({
            test: 'API Endpoint',
            description: `${endpoint.method} ${endpoint.path} responds correctly`
          });
        } else {
          this.testResults.failed.push({
            test: 'API Endpoint',
            issue: `${endpoint.method} ${endpoint.path} returned error`,
            expected: 'Status 2xx or 4xx',
            actual: `Status ${response.statusCode}`
          });
        }
      } catch (error) {
        this.testResults.failed.push({
          test: 'API Endpoint',
          issue: `${endpoint.method} ${endpoint.path} failed`,
          error: error.message
        });
      }
    }
  }

  async testWhopSDKIntegration() {
    console.log('🔍 Testing Whop SDK integration...');

    // Test Whop API connectivity
    try {
      const response = await this.makeWhopAPIRequest('https://api.whop.com/public-graphql', {
        query: 'query { viewer { user { id } } }'
      });

      if (response.statusCode === 200) {
        this.testResults.passed.push({
          test: 'Whop API Connectivity',
          description: 'Successfully connected to Whop API'
        });
      } else if (response.statusCode === 401) {
        this.testResults.failed.push({
          test: 'Whop API Authentication',
          issue: 'Invalid API credentials',
          expected: 'Valid authentication',
          actual: 'Authentication failed',
          remediation: 'Verify Whop API key and app configuration'
        });
      } else {
        this.testResults.warnings.push({
          test: 'Whop API Response',
          issue: `Unexpected response from Whop API`,
          actual: `Status ${response.statusCode}`
        });
      }
    } catch (error) {
      this.testResults.failed.push({
        test: 'Whop API Connectivity',
        issue: 'Failed to connect to Whop API',
        error: error.message,
        remediation: 'Check network connectivity and Whop API status'
      });
    }
  }

  async testUserAuthentication() {
    console.log('🔍 Testing user authentication flow...');

    // Test user API endpoint
    try {
      const response = await this.makeRequest('/api/user', 'GET');
      
      if (response.statusCode === 200) {
        const userData = JSON.parse(response.data);
        if (userData.user || userData.id) {
          this.testResults.passed.push({
            test: 'User Authentication',
            description: 'User data retrieved successfully'
          });
        } else {
          this.testResults.warnings.push({
            test: 'User Authentication',
            issue: 'User endpoint accessible but no user data',
            description: 'May be running in development mode'
          });
        }
      } else {
        this.testResults.failed.push({
          test: 'User Authentication',
          issue: 'User endpoint not accessible',
          expected: 'Status 200 with user data',
          actual: `Status ${response.statusCode}`
        });
      }
    } catch (error) {
      this.testResults.failed.push({
        test: 'User Authentication',
        issue: 'Failed to test user authentication',
        error: error.message
      });
    }
  }

  async testExperienceAccess() {
    console.log('🔍 Testing experience access...');

    try {
      // Test with valid experience ID format
      const response = await this.makeRequest('/experiences/exp_test123', 'GET');
      
      if (response.statusCode === 200) {
        this.testResults.passed.push({
          test: 'Experience Access',
          description: 'Experience pages are accessible'
        });

        // Check if chat functionality is present
        if (response.data.includes('CopyCat') || response.data.includes('chat')) {
          this.testResults.passed.push({
            test: 'Chat Interface',
            description: 'Chat interface elements detected'
          });
        }
      } else {
        this.testResults.warnings.push({
          test: 'Experience Access',
          issue: 'Experience page not fully accessible',
          description: 'May require Whop authentication in production'
        });
      }
    } catch (error) {
      this.testResults.failed.push({
        test: 'Experience Access',
        issue: 'Failed to access experience pages',
        error: error.message
      });
    }
  }

  async makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.appUrl);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhopAuthTester/1.0'
        }
      };

      if (body) {
        const bodyStr = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
      }

      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async makeWhopAPIRequest(url, body) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'x-on-behalf-of': this.credentials.agentUserId,
          'x-company-id': this.credentials.companyId
        }
      };

      const req = https.request(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(JSON.stringify(body));
      req.end();
    });
  }

  generateReport() {
    const totalTests = this.testResults.passed.length + this.testResults.failed.length;
    const passRate = (this.testResults.passed.length / totalTests) * 100;

    const report = `
🔐 WHOP AUTHENTICATION TEST REPORT
==================================

📊 Test Results:
- Tests Passed: ${this.testResults.passed.length}
- Tests Failed: ${this.testResults.failed.length}
- Warnings: ${this.testResults.warnings.length}
- Pass Rate: ${passRate.toFixed(1)}%

🎯 App Configuration:
- App URL: ${this.appUrl}
- App ID: ${this.credentials.appId || 'Not configured'}
- Company ID: ${this.credentials.companyId || 'Not configured'}
- Agent User ID: ${this.credentials.agentUserId || 'Not configured'}

${this.testResults.passed.length > 0 ? `
✅ PASSED TESTS:
${this.testResults.passed.map(t => `- ${t.test}: ${t.description}`).join('\n')}
` : ''}

${this.testResults.failed.length > 0 ? `
❌ FAILED TESTS:
${this.testResults.failed.map(t => `
- ${t.test}: ${t.issue}
  Expected: ${t.expected || 'Success'}
  Actual: ${t.actual || t.error || 'Error'}
  ${t.remediation ? `Remediation: ${t.remediation}` : ''}
`).join('\n')}
` : ''}

${this.testResults.warnings.length > 0 ? `
⚠️ WARNINGS:
${this.testResults.warnings.map(w => `- ${w.test}: ${w.issue}`).join('\n')}
` : ''}

🚀 Deployment Readiness: ${this.getDeploymentStatus(passRate)}

📋 Next Steps:
${this.getNextSteps()}
    `;

    return report;
  }

  getDeploymentStatus(passRate) {
    if (passRate >= 90) return '🟢 READY - All critical tests passing';
    if (passRate >= 75) return '🟡 MOSTLY READY - Address failed tests';
    if (passRate >= 50) return '🟠 NEEDS WORK - Multiple issues detected';
    return '🔴 NOT READY - Critical failures detected';
  }

  getNextSteps() {
    const steps = [];
    
    if (this.testResults.failed.length > 0) {
      steps.push('1. Fix all failed tests before deployment');
      steps.push('2. Verify Whop credentials are correctly configured');
      steps.push('3. Test authentication flow in Whop dashboard');
    }
    
    if (this.testResults.warnings.length > 0) {
      steps.push('4. Review and address warning items');
    }
    
    steps.push('5. Deploy to Vercel and test in production environment');
    steps.push('6. Submit app to Whop app store');
    steps.push('7. Monitor authentication flows after deployment');
    
    return steps.join('\n');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const appUrl = args[0] || 'http://localhost:3000';
  
  const tester = new WhopAuthTester(appUrl);
  
  tester.runTests().then(report => {
    console.log(report);
    
    // Save report to file
    const fs = require('fs');
    const reportFile = `whop-auth-test-${Date.now()}.txt`;
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Report saved to: ${reportFile}`);
    
    // Exit with appropriate code
    process.exit(tester.testResults.failed.length > 0 ? 1 : 0);
    
  }).catch(error => {
    console.error('❌ Whop authentication test failed:', error);
    process.exit(1);
  });
}

module.exports = WhopAuthTester;