// Email Sender Test Script
// Run this in the browser console to test if emails come from the correct sender

console.log('🔧 Email Sender Configuration Test');
console.log('==================================');

// Function to test email sender
async function testEmailSender() {
    const testEmail = `sender-test-${Date.now()}@gmail.com`;
    
    console.log(`\n📧 Testing with email: ${testEmail}`);
    console.log('⏳ Creating test user to trigger confirmation email...');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!',
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    full_name: 'Sender Test User',
                    phone: '+1234567890',
                    address: 'Test Address',
                    age: '25',
                },
            },
        });

        if (error) {
            console.error('❌ Test failed:', error.message);
            return;
        }

        if (data.user && !data.user.email_confirmed_at) {
            console.log('✅ Test user created! Confirmation email sent.');
            console.log('\n🎯 VERIFICATION STEPS:');
            console.log(`1. Check inbox for: ${testEmail}`);
            console.log('2. Look at the "From" address in the email');
            console.log('3. Expected: AI Medico <rocksamir980@gmail.com>');
            console.log('4. If you see "Supabase Auth <noreply@mail.app.supabase.io>", configuration needs updating');
            
            console.log('\n⚙️ TO FIX SENDER ADDRESS:');
            console.log('1. Go to: https://supabase.com/dashboard/project/lzukcmjplavokrvdocak');
            console.log('2. Settings → Auth → SMTP Settings');
            console.log('3. Set Sender Email: rocksamir980@gmail.com');
            console.log('4. Set Sender Name: AI Medico');
            console.log('5. Save configuration');
            
        } else {
            console.log('⚠️ User created but email status unclear');
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

// Check current configuration
function checkConfig() {
    console.log('\n📋 Current Configuration:');
    console.log('Supabase URL:', supabase.supabaseUrl);
    console.log('Project ID: lzukcmjplavokrvdocak');
    console.log('Expected Sender: rocksamir980@gmail.com');
    console.log('Expected Name: AI Medico');
}

// Auto-run
checkConfig();
console.log('\n🚀 Run testEmailSender() to test the configuration');

// Make functions available globally
window.testEmailSender = testEmailSender;
window.checkConfig = checkConfig;