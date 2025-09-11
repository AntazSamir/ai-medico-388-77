// Email Confirmation Helper Utility
// This utility helps debug and test email confirmation issues

import { supabase } from '@/integrations/supabase/client';

export interface EmailTestResult {
  success: boolean;
  message: string;
  user?: any;
  error?: string;
}

export class EmailConfirmationHelper {
  /**
   * Test the complete email confirmation flow
   */
  static async testEmailConfirmationFlow(testEmail: string): Promise<EmailTestResult> {
    try {
      console.log('🧪 Testing Email Confirmation Flow...');
      
      // Step 1: Test signup
      const signupResult = await this.testSignup(testEmail);
      if (!signupResult.success) {
        return signupResult;
      }

      // Step 2: Test resend confirmation
      const resendResult = await this.testResendConfirmation(testEmail);
      if (!resendResult.success) {
        return resendResult;
      }

      // Step 3: Test login with unconfirmed email
      const loginResult = await this.testLoginWithUnconfirmedEmail(testEmail);
      
      return {
        success: true,
        message: 'Email confirmation flow test completed successfully',
        user: signupResult.user
      };

    } catch (error) {
      return {
        success: false,
        error: `Test failed: ${error.message}`,
        message: 'Email confirmation flow test failed'
      };
    }
  }

  /**
   * Test user signup with email confirmation
   */
  static async testSignup(email: string): Promise<EmailTestResult> {
    try {
      console.log(`📧 Testing signup with email: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
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
        return {
          success: false,
          error: error.message,
          message: `Signup failed: ${error.message}`
        };
      }

      if (data.user && !data.user.email_confirmed_at) {
        return {
          success: true,
          message: 'User created successfully, confirmation email should be sent',
          user: data.user
        };
      } else if (data.user && data.user.email_confirmed_at) {
        return {
          success: true,
          message: 'User created and already confirmed (email confirmations may be disabled)',
          user: data.user
        };
      } else {
        return {
          success: false,
          error: 'Unexpected response structure',
          message: 'Signup returned unexpected response'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Signup test failed with unexpected error'
      };
    }
  }

  /**
   * Test resending confirmation email
   */
  static async testResendConfirmation(email: string): Promise<EmailTestResult> {
    try {
      console.log(`📤 Testing resend confirmation for: ${email}`);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          message: `Resend confirmation failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'Confirmation email resent successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Resend confirmation test failed'
      };
    }
  }

  /**
   * Test login with unconfirmed email
   */
  static async testLoginWithUnconfirmedEmail(email: string): Promise<EmailTestResult> {
    try {
      console.log(`🔐 Testing login with unconfirmed email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'TestPassword123!'
      });

      if (error) {
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          return {
            success: true,
            message: 'Login correctly rejected unconfirmed email (expected behavior)'
          };
        } else {
          return {
            success: false,
            error: error.message,
            message: `Login failed with unexpected error: ${error.message}`
          };
        }
      }

      // If we get here, the user was logged in despite being unconfirmed
      if (data.user && !data.user.email_confirmed_at) {
        return {
          success: false,
          error: 'User logged in despite unconfirmed email',
          message: 'Login should have been rejected for unconfirmed email'
        };
      }

      return {
        success: true,
        message: 'Login successful (user was already confirmed)'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Login test failed with unexpected error'
      };
    }
  }

  /**
   * Check user confirmation status
   */
  static async checkUserStatus(email: string): Promise<EmailTestResult> {
    try {
      console.log(`👤 Checking user status for: ${email}`);
      
      // Try to get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        // User not logged in, try to check via signin attempt
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'TestPassword123!'
        });

        if (error) {
          if (error.message.includes('email_not_confirmed')) {
            return {
              success: true,
              message: 'User exists but email not confirmed',
              user: { email, confirmed: false }
            };
          } else if (error.message.includes('Invalid login credentials')) {
            return {
              success: true,
              message: 'User not found or wrong password',
              user: { email, exists: false }
            };
          } else {
            return {
              success: false,
              error: error.message,
              message: `Error checking user status: ${error.message}`
            };
          }
        } else if (data.user) {
          return {
            success: true,
            message: 'User exists and email is confirmed',
            user: data.user
          };
        }
      } else if (user) {
        return {
          success: true,
          message: 'User is currently logged in',
          user: user
        };
      }

      return {
        success: false,
        error: 'Unable to determine user status',
        message: 'Could not check user status'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'User status check failed'
      };
    }
  }

  /**
   * Comprehensive email configuration test
   */
  static async runComprehensiveTest(): Promise<void> {
    console.log('🔧 Running Comprehensive Email Configuration Test...\n');
    
    const testEmail = `test.medico.${Date.now()}@gmail.com`;
    
    try {
      // Test 1: Basic Supabase connection
      console.log('1️⃣ Testing Supabase Connection...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('✅ Supabase connection successful');
      
      // Test 2: Signup test
      console.log('\n2️⃣ Testing User Signup...');
      const signupResult = await this.testSignup(testEmail);
      console.log(`${signupResult.success ? '✅' : '❌'} Signup: ${signupResult.message}`);
      
      if (signupResult.error) {
        console.log(`   Error: ${signupResult.error}`);
      }
      
      // Test 3: Resend confirmation
      console.log('\n3️⃣ Testing Resend Confirmation...');
      const resendResult = await this.testResendConfirmation(testEmail);
      console.log(`${resendResult.success ? '✅' : '❌'} Resend: ${resendResult.message}`);
      
      if (resendResult.error) {
        console.log(`   Error: ${resendResult.error}`);
      }
      
      // Test 4: Login with unconfirmed email
      console.log('\n4️⃣ Testing Login with Unconfirmed Email...');
      const loginResult = await this.testLoginWithUnconfirmedEmail(testEmail);
      console.log(`${loginResult.success ? '✅' : '❌'} Login: ${loginResult.message}`);
      
      if (loginResult.error) {
        console.log(`   Error: ${loginResult.error}`);
      }
      
      // Summary
      console.log('\n📊 Test Summary:');
      console.log(`   Signup: ${signupResult.success ? 'PASS' : 'FAIL'}`);
      console.log(`   Resend: ${resendResult.success ? 'PASS' : 'FAIL'}`);
      console.log(`   Login: ${loginResult.success ? 'PASS' : 'FAIL'}`);
      
      if (signupResult.success && resendResult.success && loginResult.success) {
        console.log('\n🎉 All tests passed! Email configuration appears to be working correctly.');
        console.log('📧 Check your email inbox for confirmation emails.');
      } else {
        console.log('\n🚨 Some tests failed. Check the errors above and verify SMTP configuration.');
        console.log('💡 Make sure SMTP is configured in Supabase Dashboard, not just local files.');
      }
      
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
    }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).EmailConfirmationHelper = EmailConfirmationHelper;
}

export default EmailConfirmationHelper;
