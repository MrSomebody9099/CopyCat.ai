#!/usr/bin/env node

/**
 * Security Audit Script for CopyCat.ai
 * Conducts comprehensive security analysis and recommendations
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
    this.passed = [];
  }

  // Check for common security vulnerabilities
  async runAudit() {
    console.log('🔒 Starting Security Audit for CopyCat.ai...\n');

    await this.checkEnvironmentSecurity();
    await this.checkAPIEndpointSecurity();
    await this.checkInputValidation();
    await this.checkAuthenticationSecurity();
    await this.checkDataExposure();
    await this.checkDependencySecurity();
    await this.checkCORSConfiguration();
    await this.checkContentSecurityPolicy();
    await this.checkRateLimiting();
    await this.checkErrorHandling();

    return this.generateReport();
  }

  async checkEnvironmentSecurity() {
    console.log('🔍 Checking environment security...');

    // Check for exposed secrets
    const envFiles = ['.env', '.env.local', '.env.development.local', '.env.production'];
    
    for (const envFile of envFiles) {
      const envPath = path.join(this.projectPath, envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        // Check for hardcoded secrets
        if (content.includes('your_') || content.includes('fallback') || content.includes('example')) {
          this.findings.medium.push({
            type: 'Environment Security',
            issue: `Potential placeholder values in ${envFile}`,
            description: 'Environment file contains placeholder values that should be replaced',
            remediation: 'Replace all placeholder values with actual credentials'
          });
        }

        // Check for proper secret format
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('API_KEY') && line.length < 20) {
            this.findings.high.push({
              type: 'Environment Security',
              issue: `Short API key in ${envFile}:${index + 1}`,
              description: 'API key appears to be too short or invalid',
              remediation: 'Ensure API keys are properly configured'
            });
          }
        });

        this.passed.push('Environment files exist and are being used');
      }
    }

    // Check if .env is in .gitignore
    const gitignorePath = path.join(this.projectPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        this.findings.critical.push({
          type: 'Environment Security',
          issue: 'Environment files not in .gitignore',
          description: 'Sensitive environment files may be committed to version control',
          remediation: 'Add .env* to .gitignore file'
        });
      } else {
        this.passed.push('.env files properly excluded from version control');
      }
    }
  }

  async checkAPIEndpointSecurity() {
    console.log('🔍 Checking API endpoint security...');

    const apiFiles = [
      'app/api/generate/route.ts',
      'app/api/user/route.ts',
      'app/api/sessions/route.ts',
      'app/api/messages/route.ts'
    ];

    for (const apiFile of apiFiles) {
      const apiPath = path.join(this.projectPath, apiFile);
      if (fs.existsSync(apiPath)) {
        const content = fs.readFileSync(apiPath, 'utf8');

        // Check for input validation
        if (!content.includes('await request.json()') && !content.includes('request.body')) {
          this.findings.low.push({
            type: 'API Security',
            issue: `No input parsing detected in ${apiFile}`,
            description: 'API endpoint may not be processing request body',
            remediation: 'Ensure proper input validation is implemented'
          });
        }

        // Check for error handling
        if (!content.includes('try') || !content.includes('catch')) {
          this.findings.medium.push({
            type: 'API Security',
            issue: `Missing error handling in ${apiFile}`,
            description: 'API endpoint lacks proper error handling',
            remediation: 'Implement try-catch blocks for error handling'
          });
        } else {
          this.passed.push(`Error handling implemented in ${apiFile}`);
        }

        // Check for authentication
        if (apiFile.includes('generate') && !content.includes('sessionId')) {
          this.findings.medium.push({
            type: 'API Security',
            issue: `Missing session validation in ${apiFile}`,
            description: 'API endpoint may not validate user sessions',
            remediation: 'Implement session validation middleware'
          });
        }

        // Check for SQL injection protection (if any database queries)
        if (content.includes('query') && !content.includes('sanitize')) {
          this.findings.info.push({
            type: 'API Security',
            issue: `Consider input sanitization in ${apiFile}`,
            description: 'Ensure all database queries use parameterized statements',
            remediation: 'Use parameterized queries and input sanitization'
          });
        }
      }
    }
  }

  async checkInputValidation() {
    console.log('🔍 Checking input validation...');

    const frontendFiles = [
      'app/experiences/[experienceId]/page.tsx',
      'app/utils/errorHandler.ts'
    ];

    for (const file of frontendFiles) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for input validation
        if (content.includes('validateInput')) {
          this.passed.push(`Input validation implemented in ${file}`);
        }

        // Check for XSS protection
        if (content.includes('dangerouslySetInnerHTML')) {
          this.findings.high.push({
            type: 'Input Validation',
            issue: `Potential XSS vulnerability in ${file}`,
            description: 'dangerouslySetInnerHTML can lead to XSS attacks',
            remediation: 'Sanitize HTML content or use safe alternatives'
          });
        }

        // Check for proper form validation
        if (content.includes('onChange') && !content.includes('trim()')) {
          this.findings.low.push({
            type: 'Input Validation',
            issue: `Missing input trimming in ${file}`,
            description: 'User inputs should be trimmed to prevent issues',
            remediation: 'Add .trim() to input processing'
          });
        }
      }
    }
  }

  async checkAuthenticationSecurity() {
    console.log('🔍 Checking authentication security...');

    const authFiles = [
      'lib/whop-sdk.ts',
      'app/layout.tsx'
    ];

    for (const file of authFiles) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for proper SDK usage
        if (content.includes('WhopServerSdk') || content.includes('WhopApp')) {
          this.passed.push(`Whop authentication properly configured in ${file}`);
        }

        // Check for hardcoded credentials
        if (content.includes('fallback') && content.includes('API_KEY')) {
          this.findings.high.push({
            type: 'Authentication Security',
            issue: `Fallback credentials in ${file}`,
            description: 'Hardcoded fallback credentials detected',
            remediation: 'Remove fallback credentials and use proper environment variables'
          });
        }
      }
    }

    // Check for session management
    const sessionFile = path.join(this.projectPath, 'app/hooks/useSessionManager.ts');
    if (fs.existsSync(sessionFile)) {
      const content = fs.readFileSync(sessionFile, 'utf8');
      
      if (content.includes('globalSessions')) {
        this.findings.info.push({
          type: 'Authentication Security',
          issue: 'In-memory session storage',
          description: 'Sessions are stored in memory (resets on restart)',
          remediation: 'This aligns with user preferences but consider security implications for production'
        });
      }

      this.passed.push('Session management implemented');
    }
  }

  async checkDataExposure() {
    console.log('🔍 Checking for data exposure...');

    // Check for console.log statements that might expose sensitive data
    const files = this.getAllFiles(this.projectPath, ['.ts', '.tsx', '.js', '.jsx']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('console.log') && (line.includes('API') || line.includes('key') || line.includes('token'))) {
          this.findings.medium.push({
            type: 'Data Exposure',
            issue: `Potential sensitive data logging in ${file}:${index + 1}`,
            description: 'Console.log statement may expose sensitive information',
            remediation: 'Remove or sanitize console.log statements in production'
          });
        }
      });
    }

    this.passed.push('Data exposure checks completed');
  }

  async checkDependencySecurity() {
    console.log('🔍 Checking dependency security...');

    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for outdated dependencies (basic check)
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for known vulnerable packages (basic list)
      const vulnerablePackages = ['lodash', 'moment', 'request'];
      
      for (const pkg of vulnerablePackages) {
        if (dependencies[pkg]) {
          this.findings.medium.push({
            type: 'Dependency Security',
            issue: `Potentially vulnerable package: ${pkg}`,
            description: `Package ${pkg} has known security vulnerabilities`,
            remediation: `Update ${pkg} to latest version or find alternative`
          });
        }
      }

      this.passed.push('Dependency security check completed');
    }
  }

  async checkCORSConfiguration() {
    console.log('🔍 Checking CORS configuration...');

    const vercelConfigPath = path.join(this.projectPath, 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
      const content = fs.readFileSync(vercelConfigPath, 'utf8');
      
      if (content.includes('"value": "*"')) {
        this.findings.medium.push({
          type: 'CORS Security',
          issue: 'Wildcard CORS origin detected',
          description: 'CORS is configured to allow all origins (*)',
          remediation: 'Configure specific allowed origins for production'
        });
      } else {
        this.passed.push('CORS configuration appears secure');
      }
    }
  }

  async checkContentSecurityPolicy() {
    console.log('🔍 Checking Content Security Policy...');

    const nextConfigPath = path.join(this.projectPath, 'next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (!content.includes('Content-Security-Policy')) {
        this.findings.medium.push({
          type: 'Content Security',
          issue: 'Missing Content Security Policy',
          description: 'No CSP headers detected in Next.js configuration',
          remediation: 'Implement Content Security Policy headers'
        });
      } else {
        this.passed.push('Content Security Policy configured');
      }
    }
  }

  async checkRateLimiting() {
    console.log('🔍 Checking rate limiting...');

    const apiFiles = this.getAllFiles(path.join(this.projectPath, 'app/api'), ['.ts']);
    let hasRateLimiting = false;

    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('rate') && content.includes('limit')) {
        hasRateLimiting = true;
        break;
      }
    }

    if (!hasRateLimiting) {
      this.findings.medium.push({
        type: 'Rate Limiting',
        issue: 'No rate limiting detected',
        description: 'API endpoints lack rate limiting protection',
        remediation: 'Implement rate limiting to prevent abuse'
      });
    } else {
      this.passed.push('Rate limiting implemented');
    }
  }

  async checkErrorHandling() {
    console.log('🔍 Checking error handling...');

    const errorHandlerPath = path.join(this.projectPath, 'app/utils/errorHandler.ts');
    if (fs.existsSync(errorHandlerPath)) {
      const content = fs.readFileSync(errorHandlerPath, 'utf8');
      
      if (content.includes('ChatError') && content.includes('handleApiError')) {
        this.passed.push('Comprehensive error handling implemented');
      }

      // Check if errors expose sensitive information
      if (content.includes('details') && content.includes('error.message')) {
        this.findings.low.push({
          type: 'Error Handling',
          issue: 'Potential information disclosure in errors',
          description: 'Error messages might expose internal details',
          remediation: 'Sanitize error messages before sending to client'
        });
      }
    }
  }

  getAllFiles(dir, extensions, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.getAllFiles(fullPath, extensions, files);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateReport() {
    const totalFindings = Object.values(this.findings).flat().length;
    const securityScore = Math.max(0, 100 - (totalFindings * 5));

    const report = `
🔒 SECURITY AUDIT REPORT
========================

📊 Security Score: ${securityScore}/100

🎯 Summary:
- Critical Issues: ${this.findings.critical.length}
- High Risk Issues: ${this.findings.high.length}
- Medium Risk Issues: ${this.findings.medium.length}
- Low Risk Issues: ${this.findings.low.length}
- Informational: ${this.findings.info.length}
- Security Controls Passed: ${this.passed.length}

${this.findings.critical.length > 0 ? `
🚨 CRITICAL ISSUES:
${this.findings.critical.map(f => `- ${f.issue}: ${f.description}\n  → ${f.remediation}`).join('\n\n')}
` : ''}

${this.findings.high.length > 0 ? `
⚠️ HIGH RISK ISSUES:
${this.findings.high.map(f => `- ${f.issue}: ${f.description}\n  → ${f.remediation}`).join('\n\n')}
` : ''}

${this.findings.medium.length > 0 ? `
🔶 MEDIUM RISK ISSUES:
${this.findings.medium.map(f => `- ${f.issue}: ${f.description}\n  → ${f.remediation}`).join('\n\n')}
` : ''}

${this.findings.low.length > 0 ? `
🔸 LOW RISK ISSUES:
${this.findings.low.map(f => `- ${f.issue}: ${f.description}\n  → ${f.remediation}`).join('\n\n')}
` : ''}

${this.findings.info.length > 0 ? `
ℹ️ INFORMATIONAL:
${this.findings.info.map(f => `- ${f.issue}: ${f.description}\n  → ${f.remediation}`).join('\n\n')}
` : ''}

✅ SECURITY CONTROLS PASSED:
${this.passed.map(p => `- ${p}`).join('\n')}

🛡️ SECURITY RECOMMENDATIONS:

For Production Deployment:
1. Implement Content Security Policy (CSP) headers
2. Add rate limiting to all API endpoints
3. Configure CORS with specific allowed origins
4. Remove all console.log statements containing sensitive data
5. Implement request/response logging for monitoring
6. Add input sanitization and validation middleware
7. Configure security headers (HSTS, X-Frame-Options, etc.)
8. Implement API authentication middleware
9. Set up monitoring and alerting for security events
10. Regular dependency security updates

For Whop Integration:
1. Validate all Whop SDK responses
2. Implement proper session management
3. Secure environment variable handling
4. Add request signing verification
5. Implement proper user authorization checks

Overall Assessment: ${this.getOverallAssessment(securityScore)}
    `;

    return report;
  }

  getOverallAssessment(score) {
    if (score >= 90) return '🟢 EXCELLENT - Ready for production deployment';
    if (score >= 75) return '🟡 GOOD - Address medium/high issues before production';
    if (score >= 60) return '🟠 FAIR - Significant security improvements needed';
    return '🔴 POOR - Critical security issues must be resolved';
  }
}

// CLI interface
if (require.main === module) {
  const auditor = new SecurityAuditor();
  
  auditor.runAudit().then(report => {
    console.log(report);
    
    // Save report to file
    const reportFile = `security-audit-${Date.now()}.txt`;
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Security report saved to: ${reportFile}`);
    
    // Exit with appropriate code based on critical/high findings
    const criticalHighCount = auditor.findings.critical.length + auditor.findings.high.length;
    process.exit(criticalHighCount > 0 ? 1 : 0);
    
  }).catch(error => {
    console.error('❌ Security audit failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;