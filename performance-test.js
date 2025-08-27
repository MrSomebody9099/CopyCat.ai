#!/usr/bin/env node

/**
 * Performance Testing Script for CopyCat.ai
 * Tests application performance with 500+ concurrent users
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

class PerformanceTestRunner {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      responseTimes: [],
      errors: [],
      concurrentUsers: 0
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PerformanceTest/1.0'
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }

      const req = httpModule.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: responseData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        reject({
          error: error.message,
          responseTime,
          success: false
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async simulateUser(userId, duration = 60000) {
    const userResults = {
      requests: 0,
      successful: 0,
      failed: 0,
      responseTimes: []
    };

    const startTime = Date.now();
    
    while (Date.now() - startTime < duration) {
      try {
        // Simulate typical user flow
        const actions = [
          () => this.makeRequest('/experiences/test'),
          () => this.makeRequest('/api/generate', 'POST', {
            userInput: `Test message from user ${userId}`,
            sessionId: `session-${userId}-${Date.now()}`
          }),
          () => this.makeRequest('/api/user'),
        ];

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const result = await randomAction();
        
        userResults.requests++;
        userResults.responseTimes.push(result.responseTime);
        
        if (result.success) {
          userResults.successful++;
        } else {
          userResults.failed++;
        }

        // Simulate user think time (1-5 seconds)
        const thinkTime = Math.random() * 4000 + 1000;
        await new Promise(resolve => setTimeout(resolve, thinkTime));

      } catch (error) {
        userResults.requests++;
        userResults.failed++;
        this.results.errors.push(`User ${userId}: ${error.error || error.message}`);
      }
    }

    return userResults;
  }

  async runConcurrentTest(numUsers = 500, duration = 60000) {
    console.log(`🚀 Starting performance test with ${numUsers} concurrent users for ${duration/1000} seconds...`);
    
    this.results.concurrentUsers = numUsers;
    const startTime = performance.now();

    // Create array of user simulation promises
    const userPromises = [];
    for (let i = 0; i < numUsers; i++) {
      userPromises.push(this.simulateUser(i + 1, duration));
    }

    // Wait for all users to complete
    const userResults = await Promise.allSettled(userPromises);
    
    const endTime = performance.now();
    const totalTestTime = endTime - startTime;

    // Aggregate results
    userResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const userResult = result.value;
        this.results.totalRequests += userResult.requests;
        this.results.successfulRequests += userResult.successful;
        this.results.failedRequests += userResult.failed;
        this.results.responseTimes.push(...userResult.responseTimes);
      } else {
        this.results.errors.push(`User ${index + 1} simulation failed: ${result.reason}`);
      }
    });

    // Calculate statistics
    if (this.results.responseTimes.length > 0) {
      this.results.averageResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
      this.results.maxResponseTime = Math.max(...this.results.responseTimes);
      this.results.minResponseTime = Math.min(...this.results.responseTimes);
    }

    this.results.totalTestTime = totalTestTime;
    this.results.requestsPerSecond = this.results.totalRequests / (totalTestTime / 1000);

    return this.results;
  }

  generateReport() {
    const report = `
📊 PERFORMANCE TEST REPORT
==========================

🎯 Test Configuration:
- Concurrent Users: ${this.results.concurrentUsers}
- Total Test Time: ${(this.results.totalTestTime / 1000).toFixed(2)} seconds
- Base URL: ${this.baseUrl}

📈 Request Statistics:
- Total Requests: ${this.results.totalRequests}
- Successful: ${this.results.successfulRequests} (${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(1)}%)
- Failed: ${this.results.failedRequests} (${((this.results.failedRequests / this.results.totalRequests) * 100).toFixed(1)}%)
- Requests/Second: ${this.results.requestsPerSecond.toFixed(2)}

⏱️ Response Time Analysis:
- Average: ${this.results.averageResponseTime.toFixed(2)}ms
- Minimum: ${this.results.minResponseTime.toFixed(2)}ms
- Maximum: ${this.results.maxResponseTime.toFixed(2)}ms

📊 Performance Benchmarks:
${this.evaluatePerformance()}

${this.results.errors.length > 0 ? `
🚨 Errors (${this.results.errors.length} total):
${this.results.errors.slice(0, 10).map(error => `- ${error}`).join('\n')}
${this.results.errors.length > 10 ? `... and ${this.results.errors.length - 10} more` : ''}
` : '✅ No errors detected!'}

💡 Recommendations:
${this.getRecommendations()}
    `;

    return report;
  }

  evaluatePerformance() {
    const benchmarks = [];
    
    // Response time benchmarks
    if (this.results.averageResponseTime < 500) {
      benchmarks.push('✅ Excellent response time (< 500ms)');
    } else if (this.results.averageResponseTime < 2000) {
      benchmarks.push('⚠️ Acceptable response time (500-2000ms)');
    } else {
      benchmarks.push('❌ Poor response time (> 2000ms)');
    }

    // Success rate benchmarks
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    if (successRate >= 99) {
      benchmarks.push('✅ Excellent success rate (≥ 99%)');
    } else if (successRate >= 95) {
      benchmarks.push('⚠️ Good success rate (95-99%)');
    } else {
      benchmarks.push('❌ Poor success rate (< 95%)');
    }

    // Throughput benchmarks
    if (this.results.requestsPerSecond >= 100) {
      benchmarks.push('✅ High throughput (≥ 100 req/s)');
    } else if (this.results.requestsPerSecond >= 50) {
      benchmarks.push('⚠️ Moderate throughput (50-100 req/s)');
    } else {
      benchmarks.push('❌ Low throughput (< 50 req/s)');
    }

    return benchmarks.join('\n');
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.results.averageResponseTime > 2000) {
      recommendations.push('- Consider implementing response caching');
      recommendations.push('- Optimize API endpoints and database queries');
      recommendations.push('- Consider using a CDN for static assets');
    }

    if (this.results.failedRequests > this.results.totalRequests * 0.05) {
      recommendations.push('- Implement better error handling and retry logic');
      recommendations.push('- Add circuit breakers for external services');
      recommendations.push('- Monitor and scale server resources');
    }

    if (this.results.requestsPerSecond < 50) {
      recommendations.push('- Scale server resources (CPU, memory)');
      recommendations.push('- Implement connection pooling');
      recommendations.push('- Consider horizontal scaling');
    }

    if (recommendations.length === 0) {
      recommendations.push('- Performance looks good! Continue monitoring in production');
      recommendations.push('- Consider implementing real-time monitoring');
      recommendations.push('- Set up automated performance alerts');
    }

    return recommendations.join('\n');
  }

  async runQuickTest() {
    console.log('🔍 Running quick performance test (50 users, 30 seconds)...');
    return await this.runConcurrentTest(50, 30000);
  }

  async runFullTest() {
    console.log('🎯 Running full performance test (500 users, 60 seconds)...');
    return await this.runConcurrentTest(500, 60000);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  const testType = args[1] || 'quick';
  
  const tester = new PerformanceTestRunner(baseUrl);
  
  async function runTest() {
    try {
      let results;
      
      if (testType === 'full') {
        results = await tester.runFullTest();
      } else {
        results = await tester.runQuickTest();
      }
      
      console.log(tester.generateReport());
      
      // Save results to file
      const fs = require('fs');
      const reportFile = `performance-report-${Date.now()}.txt`;
      fs.writeFileSync(reportFile, tester.generateReport());
      console.log(`\n📄 Report saved to: ${reportFile}`);
      
      // Exit with appropriate code
      const successRate = (results.successfulRequests / results.totalRequests) * 100;
      process.exit(successRate >= 95 ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      process.exit(1);
    }
  }
  
  runTest();
}

module.exports = PerformanceTestRunner;