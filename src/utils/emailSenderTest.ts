// Email Sender Configuration Test
// This utility helps verify that emails are sent from the correct address

import { supabase } from '../integrations/supabase/client';

export interface EmailSenderTestResult {
  success: boolean;
  userCreated: boolean;
  expectedSender: string;
  actualSender?: string;
  message: string;
  userDetails?: any;
}

export const testEmailSender = async (testEmail: string): Promise<EmailSenderTestResult> => {
  const expectedSender = 'rocksamir980@gmail.com';
  
  console.log('🧪 Testing Email Sender Configuration...');
  console.log(`📧 Test email: ${testEmail}`);
  console.log(`🎯 Expected sender: ${expectedSender}`);
  
  try {
    // Attempt to create a test user to trigger confirmation email
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: 'Email Sender Test User',
          phone: '+1234567890',
          address: 'Test Address',
          age: '25',
        },
      },
    });

    if (error) {
      return {
        success: false,
        userCreated: false,
        expectedSender,
        message: `Failed to create test user: ${error.message}`,
      };
    }

    if (data.user) {
      console.log('✅ Test user created successfully');
      console.log('📊 User details:', {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        created_at: data.user.created_at,
      });

      if (!data.user.email_confirmed_at) {
        return {
          success: true,
          userCreated: true,
          expectedSender,
          message: `✅ Confirmation email sent! Please check ${testEmail} and verify the sender address.
          
Expected: AI Medico <${expectedSender}>
If you see 'Supabase Auth <noreply@mail.app.supabase.io>', the dashboard configuration needs to be updated.

Next steps:
1. Check your email inbox (including spam folder)
2. Look at the sender address in the email
3. If it's not from ${expectedSender}, update Supabase Dashboard SMTP settings`,
          userDetails: {
            id: data.user.id,
            email: data.user.email,
          },
        };
      } else {
        return {
          success: true,
          userCreated: true,
          expectedSender,
          message: '⚠️ User created but email was auto-confirmed (unusual for new signup)',
          userDetails: {
            id: data.user.id,
            email: data.user.email,
          },
        };
      }
    } else {
      return {
        success: false,
        userCreated: false,
        expectedSender,
        message: 'No user data returned from signup',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      userCreated: false,
      expectedSender,
      message: `Unexpected error: ${err.message}`,
    };
  }
};

// Helper function to generate a unique test email
export const generateTestEmail = (): string => {
  const timestamp = Date.now();
  return `email-sender-test-${timestamp}@gmail.com`;
};

// Quick test function for browser console
export const quickSenderTest = async (): Promise<void> => {
  const testEmail = generateTestEmail();
  console.log('🚀 Starting Email Sender Test...');
  
  const result = await testEmailSender(testEmail);
  
  console.log('\n📋 TEST RESULTS:');
  console.log('================');
  console.log(`Success: ${result.success ? '✅' : '❌'}`);
  console.log(`User Created: ${result.userCreated ? '✅' : '❌'}`);
  console.log(`Expected Sender: ${result.expectedSender}`);
  console.log(`Message: ${result.message}`);
  
  if (result.userDetails) {
    console.log('\n👤 User Details:');
    console.log(result.userDetails);
  }
  
  console.log('\n🔍 Manual Verification Steps:');
  console.log(`1. Check email: ${testEmail}`);
  console.log('2. Look at the "From" address');
  console.log('3. Should be: AI Medico <rocksamir980@gmail.com>');
  console.log('4. If not, update Supabase Dashboard SMTP settings');
};

// Configuration checker
export const checkEmailConfig = (): void => {
  console.log('⚙️ Current Email Configuration:');
  console.log('================================');
  console.log('Supabase URL:', supabase.supabaseUrl);
  console.log('Expected Sender: rocksamir980@gmail.com');
  console.log('Expected Name: AI Medico');
  console.log('');
  console.log('📌 To fix sender address:');
  console.log('1. Go to Supabase Dashboard → Settings → Auth → SMTP');
  console.log('2. Set Sender Email: rocksamir980@gmail.com');
  console.log('3. Set Sender Name: AI Medico');
  console.log('4. Save configuration');
  console.log('');
  console.log('🧪 Run quickSenderTest() to test the configuration');
};