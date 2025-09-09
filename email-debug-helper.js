/**
 * Email Debug Helper Script
 * Use this script to test email functionality after configuring SMTP
 */

import { supabase } from './src/integrations/supabase/client.js';

class EmailDebugHelper {
  constructor() {
    this.testEmail = 'test.user.medico@gmail.com'; // Change this to your test email
    this.results = [];
  }

  async testEmailConfiguration() {
    console.log('🔧 Starting Email Configuration Test...\n');
    
    // Test 1: Basic Supabase connection
    await this.testSupabaseConnection();
    
    // Test 2: Test signup with email confirmation
    await this.testSignupWithConfirmation();
    
    // Test 3: Check user creation status
    await this.checkUserStatus();
    
    // Display results
    this.displayResults();
  }

  async testSupabaseConnection() {
    console.log('1️⃣ Testing Supabase Connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        this.addResult('❌', 'Supabase Connection', `Error: ${error.message}`);
      } else {
        this.addResult('✅', 'Supabase Connection', 'Connected successfully');
      }
    } catch (err) {
      this.addResult('❌', 'Supabase Connection', `Unexpected error: ${err.message}`);
    }
  }

  async testSignupWithConfirmation() {
    console.log('2️⃣ Testing Signup with Email Confirmation...');
    try {
      // Generate unique email for testing
      const timestamp = Date.now();
      const testEmail = `test.medico.${timestamp}@gmail.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: 'Test User',
            phone: '+1234567890',
            address: 'Test Address',
            age: '25',
          },
        },
      });

      if (error) {
        this.addResult('❌', 'Email Signup Test', `Error: ${error.message}`);
      } else if (data.user && !data.user.email_confirmed_at) {
        this.addResult('✅', 'Email Signup Test', `User created successfully. Confirmation email should be sent to ${testEmail}`);
        this.testUserData = data.user;
      } else if (data.user && data.user.email_confirmed_at) {
        this.addResult('⚠️', 'Email Signup Test', 'User created but already confirmed (unexpected)');
        this.testUserData = data.user;
      } else {
        this.addResult('⚠️', 'Email Signup Test', 'Unexpected response format');
      }
    } catch (err) {
      this.addResult('❌', 'Email Signup Test', `Unexpected error: ${err.message}`);
    }
  }

  async checkUserStatus() {
    if (!this.testUserData) {
      this.addResult('⚠️', 'User Status Check', 'No test user data available');
      return;
    }

    console.log('3️⃣ Checking User Status...');
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(this.testUserData.id);
      
      if (error) {
        this.addResult('❌', 'User Status Check', `Error: ${error.message}`);
      } else {
        const status = {
          id: user.id,
          email: user.email,
          confirmed: user.email_confirmed_at ? 'Yes' : 'No',
          created: user.created_at,
          lastSignIn: user.last_sign_in_at || 'Never'
        };
        this.addResult('✅', 'User Status Check', JSON.stringify(status, null, 2));
      }
    } catch (err) {
      this.addResult('⚠️', 'User Status Check', `Cannot check user status: ${err.message}`);
    }
  }

  addResult(icon, test, message) {
    const result = { icon, test, message, timestamp: new Date().toISOString() };
    this.results.push(result);
    console.log(`${icon} ${test}: ${message}`);
  }

  displayResults() {
    console.log('\n📊 Email Configuration Test Results:');
    console.log('=' .repeat(50));
    
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.icon} ${result.test}`);
      console.log(`   ${result.message}`);
      console.log(`   Time: ${result.timestamp}\n`);
    });

    // Summary
    const passed = this.results.filter(r => r.icon === '✅').length;
    const failed = this.results.filter(r => r.icon === '❌').length;
    const warnings = this.results.filter(r => r.icon === '⚠️').length;

    console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    
    if (failed === 0 && warnings === 0) {
      console.log('🎉 All tests passed! Email configuration should be working.');
    } else if (failed > 0) {
      console.log('🚨 Critical issues found. Please check Supabase dashboard SMTP settings.');
    } else {
      console.log('⚠️ Some warnings found. Monitor email delivery carefully.');
    }

    return {
      passed,
      failed,
      warnings,
      results: this.results
    };
  }
}

// Usage instructions
console.log(`
📧 Email Debug Helper Usage:

1. Open browser console (F12)
2. Copy and paste this entire script
3. Run: const debugger = new EmailDebugHelper(); await debugger.testEmailConfiguration();
4. Check console output for results

After configuring SMTP in Supabase dashboard:
1. Update Gmail app password
2. Save SMTP settings in Supabase
3. Run this test script
4. Check test email inbox (including spam folder)

IMPORTANT: Make sure to configure SMTP in Supabase Dashboard, not just local config!
`);

// Export for use
if (typeof window !== 'undefined') {
  window.EmailDebugHelper = EmailDebugHelper;
}

export default EmailDebugHelper;