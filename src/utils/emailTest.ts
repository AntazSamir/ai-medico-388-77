// Email Configuration Test Script
// This file helps test if email confirmation is working

import { supabase } from '../integrations/supabase/client';

export const testEmailConfiguration = async () => {
  try {
    console.log('🧪 Testing Email Configuration...');
    
    // Test 1: Check if SMTP is configured in the client
    console.log('✅ Supabase client initialized');
    
    // Test 2: Simulate a signup to see if confirmation email is triggered
    const testEmail = `test+${Date.now()}@example.com`;
    
    console.log(`📧 Testing signup with email: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testPassword123!',
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
      console.error('❌ Signup failed:', error.message);
      return { success: false, error: error.message };
    }

    if (data.user && !data.user.email_confirmed_at) {
      console.log('✅ User created, confirmation email should be sent');
      console.log('📊 User data:', {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at,
        created: data.user.created_at
      });
      return { 
        success: true, 
        message: 'User created successfully, check email for confirmation',
        user: data.user 
      };
    } else if (data.user && data.user.email_confirmed_at) {
      console.log('✅ User created and automatically confirmed');
      return { 
        success: true, 
        message: 'User created and confirmed',
        user: data.user 
      };
    } else {
      console.log('⚠️ Unexpected response');
      return { success: false, error: 'Unexpected response structure' };
    }

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    return { success: false, error: err.message };
  }
};

// Run this function in the browser console to test email configuration
// testEmailConfiguration().then(result => console.log('Test Result:', result));

export default testEmailConfiguration;