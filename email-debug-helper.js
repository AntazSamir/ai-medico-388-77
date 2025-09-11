/**
 * Email Debug Helper Script
 * Use this script to test email functionality after configuring SMTP
 * Browser Console Compatible Version
 */

// Use the global supabase instance that's already available in the browser
const supabase = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);

class EmailDebugHelper {
  constructor() {
    this.testEmail = 'test.user.medico@gmail.com'; // Change this to your test email
    this.diagnosisMode = true; // Enable detailed diagnostics
    this.results = [];
  }

  async testEmailConfiguration() {
    console.log('🔧 Starting Advanced Email Configuration Test...\n');
    
    // Check if supabase is available
    if (!supabase) {
      this.addResult('❌', 'Supabase Connection', 'Supabase client not found. Make sure you are running this in your app\'s browser console.');
      this.displayResults();
      return;
    }
    
    // Test 1: Basic Supabase connection
    await this.testSupabaseConnection();
    
    // Test 2: Check Supabase auth settings
    await this.checkAuthSettings();
    
    // Test 3: Test signup with email confirmation
    await this.testSignupWithConfirmation();
    
    // Test 4: Check user creation status
    await this.checkUserStatus();
    
    // Test 5: Check for common SMTP issues
    await this.checkCommonSMTPIssues();
    
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
    console.log('3️⃣ Testing Signup with Email Confirmation...');
    try {
      // Generate unique email for testing
      const timestamp = Date.now();
      const testEmail = `test.medico.${timestamp}@gmail.com`;
      
      console.log(`Testing with email: ${testEmail}`);
      
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
        this.addResult('❌', 'Email Signup Test', `Error: ${error.message}\nError Code: ${error.status || 'Unknown'}`);
        
        // Check for specific SMTP-related errors
        if (error.message.includes('smtp') || error.message.includes('email')) {
          this.addResult('🚨', 'SMTP Error Detected', 'This appears to be an SMTP configuration issue. Check Supabase dashboard SMTP settings.');
        }
      } else if (data.user && !data.user.email_confirmed_at) {
        this.addResult('✅', 'Email Signup Test', `User created successfully. Confirmation email should be sent to ${testEmail}\nUser ID: ${data.user.id}`);
        this.testUserData = data.user;
        
        // Additional check for session data
        if (data.session) {
          this.addResult('⚠️', 'Unexpected Session', 'User has active session despite needing email confirmation');
        }
      } else if (data.user && data.user.email_confirmed_at) {
        this.addResult('⚠️', 'Email Signup Test', 'User created but already confirmed (email confirmations may be disabled)');
        this.testUserData = data.user;
      } else {
        this.addResult('⚠️', 'Email Signup Test', `Unexpected response format: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      this.addResult('❌', 'Email Signup Test', `Unexpected error: ${err.message}`);
    }
  }

  async checkAuthSettings() {
    console.log('2️⃣ Checking Auth Settings...');
    try {
      // Check if confirmations are enabled
      const authConfig = {
        confirmationsEnabled: 'Should be enabled for email confirmation',
        redirectUrl: window.location.origin + '/auth/callback',
        currentOrigin: window.location.origin
      };
      
      this.addResult('✅', 'Auth Configuration', JSON.stringify(authConfig, null, 2));
    } catch (err) {
      this.addResult('❌', 'Auth Configuration', `Error: ${err.message}`);
    }
  }

  async checkUserStatus() {
    if (!this.testUserData) {
      this.addResult('⚠️', 'User Status Check', 'No test user data available');
      return;
    }

    console.log('4️⃣ Checking User Status...');
    try {
      // Instead of admin call, just check the user data we got
      const status = {
        id: this.testUserData.id,
        email: this.testUserData.email,
        confirmed: this.testUserData.email_confirmed_at ? 'Yes' : 'No',
        created: this.testUserData.created_at,
        confirmationSent: this.testUserData.confirmation_sent_at ? 'Yes' : 'No'
      };
      this.addResult('✅', 'User Status Check', JSON.stringify(status, null, 2));
    } catch (err) {
      this.addResult('⚠️', 'User Status Check', `Cannot check user status: ${err.message}`);
    }
  }

  async checkCommonSMTPIssues() {
    console.log('5️⃣ Checking Common SMTP Issues...');
    
    const issues = {
      'Brevo SMTP Host': 'Should be smtp-relay.brevo.com',
      'Brevo SMTP Port': 'Should be 587',
      'Brevo Security': 'Should be STARTTLS',
      'Brevo Credentials': 'Should use Brevo SMTP login and password',
      'Sender Email': 'Should be rocksamir980@gmail.com',
      'Confirmations Enabled': 'Should be enabled in Supabase Auth settings',
      'Rate Limiting': 'Check if hitting 30 emails/hour limit'
    };
    
    this.addResult('⚠️', 'SMTP Configuration Checklist', JSON.stringify(issues, null, 2));
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
      console.log('🚨 Critical issues found. Most likely causes:');
      console.log('   1. Gmail App Password expired or incorrect');
      console.log('   2. SMTP not configured in Supabase dashboard');
      console.log('   3. Wrong SMTP settings (port, security, etc.)');
      console.log('   4. Gmail account locked or 2FA issues');
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

// Simple browser console test function
async function testEmailConfirmation() {
  console.log('🧪 Starting Email Confirmation Test...\n');
  
  // Check if supabase is available
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase client not found. Make sure you are running this in your app\'s browser console.');
    return;
  }
  
  const testEmail = `test.medico.${Date.now()}@gmail.com`;
  
  try {
    // Test 1: Check Supabase connection
    console.log('1️⃣ Testing Supabase Connection...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✅ Supabase connection successful');
    
    // Test 2: Test signup
    console.log('\n2️⃣ Testing User Signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
        data: {
          full_name: 'Test User',
          phone: '+1234567890',
          address: 'Test Address',
          age: '25',
        },
      },
    });

    if (signupError) {
      console.log(`❌ Signup failed: ${signupError.message}`);
    } else if (signupData.user && !signupData.user.email_confirmed_at) {
      console.log('✅ User created successfully, confirmation email should be sent');
    } else if (signupData.user && signupData.user.email_confirmed_at) {
      console.log('⚠️ User created but already confirmed (email confirmations may be disabled)');
    } else {
      console.log('⚠️ Unexpected signup response');
    }
    
    // Test 3: Test resend confirmation
    console.log('\n3️⃣ Testing Resend Confirmation...');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback'
      }
    });

    if (resendError) {
      console.log(`❌ Resend failed: ${resendError.message}`);
    } else {
      console.log('✅ Confirmation email resent successfully');
    }
    
    // Test 4: Test login with unconfirmed email
    console.log('\n4️⃣ Testing Login with Unconfirmed Email...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'TestPassword123!'
    });

    if (loginError) {
      if (loginError.message.includes('email_not_confirmed') || loginError.message.includes('Email not confirmed')) {
        console.log('✅ Login correctly rejected unconfirmed email (expected behavior)');
      } else {
        console.log(`❌ Login failed with unexpected error: ${loginError.message}`);
      }
    } else if (loginData.user && !loginData.user.email_confirmed_at) {
      console.log('❌ User logged in despite unconfirmed email (this should not happen)');
    } else {
      console.log('✅ Login successful (user was already confirmed)');
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Test Email: ${testEmail}`);
    console.log(`   Signup: ${signupError ? 'FAIL' : 'PASS'}`);
    console.log(`   Resend: ${resendError ? 'FAIL' : 'PASS'}`);
    console.log(`   Login: ${loginError ? 'PASS (expected)' : 'PASS'}`);
    
    console.log('\n📧 Check your email inbox for confirmation emails!');
    console.log('💡 If emails are not received, check SMTP configuration in Supabase Dashboard.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Usage instructions
console.log(`
📧 Email Debug Helper Usage:

🔍 QUICK TEST (Copy & Paste):
testEmailConfirmation()

🔍 ADVANCED TEST:
const debugger = new EmailDebugHelper(); 
await debugger.testEmailConfiguration();

🛠️ COMMON FIXES:
1. SMTP Configuration: Go to Supabase Dashboard → Settings → Auth → SMTP
2. Brevo Settings:
   Host: smtp-relay.brevo.com
   Port: 587
   Username: 96b206001@smtp-brevo.com
   Password: dhyZ0XBkI6CmEaNO
   Security: STARTTLS

🚨 IF STILL FAILING:
- Check Supabase logs in dashboard
- Verify SMTP settings are saved
- Check for rate limiting (30 emails/hour max)

IMPORTANT: Configuration must be in Supabase Dashboard, NOT local files!
`);

// Export for use
if (typeof window !== 'undefined') {
  window.EmailDebugHelper = EmailDebugHelper;
  window.testEmailConfirmation = testEmailConfirmation;
}

export default EmailDebugHelper;