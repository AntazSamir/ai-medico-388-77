// Node.js email test script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzukcmjplavokrvdocak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dWtjbWpwbGF2b2tydmRvY2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjU1MjUsImV4cCI6MjA3MTgwMTUyNX0.UABFbOI6SPUrDcB91lobrBYTCaTNNor38CGHxbyMUTY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSignup() {
    console.log('🧪 Testing Email Signup...\n');
    
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`📧 Testing with email: ${testEmail}`);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!',
            options: {
                emailRedirectTo: 'http://localhost:3000/auth/callback'
            }
        });

        if (error) {
            console.error('❌ Signup Error:', error.message);
            console.error('📊 Error details:', error);
            return false;
        }

        console.log('✅ Signup successful!');
        console.log('📊 User data:', {
            id: data.user?.id,
            email: data.user?.email,
            email_confirmed_at: data.user?.email_confirmed_at,
            created_at: data.user?.created_at
        });

        if (!data.user?.email_confirmed_at) {
            console.log('📧 ✅ Confirmation email should have been sent!');
            console.log(`📬 Check inbox for: ${testEmail}`);
            console.log('📬 Also check spam/junk folder');
            return true;
        } else {
            console.log('⚠️ User email already confirmed (unusual for new signup)');
            return true;
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        return false;
    }
}

async function testPasswordReset() {
    console.log('\n🔐 Testing Password Reset...\n');
    
    const testEmail = 'test@example.com';
    console.log(`📧 Testing password reset for: ${testEmail}`);
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
            redirectTo: 'http://localhost:3000/reset-password'
        });

        if (error) {
            console.error('❌ Password Reset Error:', error.message);
            return false;
        }

        console.log('✅ Password reset email sent!');
        console.log(`📬 Check inbox for: ${testEmail}`);
        return true;
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        return false;
    }
}

async function testResendConfirmation() {
    console.log('\n📤 Testing Resend Confirmation...\n');
    
    const testEmail = 'test@example.com';
    console.log(`📧 Resending confirmation for: ${testEmail}`);
    
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: testEmail,
            options: {
                emailRedirectTo: 'http://localhost:3000/auth/callback'
            }
        });

        if (error) {
            console.error('❌ Resend Error:', error.message);
            return false;
        }

        console.log('✅ Confirmation email resent!');
        console.log(`📬 Check inbox for: ${testEmail}`);
        return true;
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting Email Tests...\n');
    console.log('=' .repeat(50));
    
    const results = {
        signup: await testEmailSignup(),
        reset: await testPasswordReset(),
        resend: await testResendConfirmation()
    };
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results Summary:');
    console.log(`Signup Test: ${results.signup ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Reset Test: ${results.reset ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Resend Test: ${results.resend ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n🎉 Email functionality is working! Check your inbox for test emails.');
    } else {
        console.log('\n⚠️ Some email tests failed. Check your SMTP configuration.');
    }
}

// Run tests
runAllTests().catch(console.error);
