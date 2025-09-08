// Email Diagnosis Script for AI Medico
// Run this in the browser console to diagnose email delivery issues

console.log('🔧 AI Medico Email Diagnosis Started...');

const emailDiagnosis = {
    async runFullDiagnosis() {
        console.log('\n📋 FULL EMAIL DELIVERY DIAGNOSIS');
        console.log('=====================================');
        
        await this.checkSupabaseConnection();
        await this.checkAuthConfiguration();
        await this.testEmailDelivery();
        this.checkCommonIssues();
        this.provideSolutions();
    },

    async checkSupabaseConnection() {
        console.log('\n1️⃣ Checking Supabase Connection...');
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('❌ Supabase connection error:', error.message);
            } else {
                console.log('✅ Supabase connection successful');
                console.log('🌐 Supabase URL:', supabase.supabaseUrl);
                console.log('🔑 API Key (first 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
            }
        } catch (err) {
            console.error('❌ Failed to connect to Supabase:', err.message);
        }
    },

    async checkAuthConfiguration() {
        console.log('\n2️⃣ Checking Auth Configuration...');
        try {
            // Try to get current user to verify auth is working
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error && error.message !== 'Invalid JWT') {
                console.error('❌ Auth configuration error:', error.message);
            } else {
                console.log('✅ Auth configuration appears correct');
            }
        } catch (err) {
            console.error('❌ Auth check failed:', err.message);
        }
    },

    async testEmailDelivery() {
        console.log('\n3️⃣ Testing Email Delivery...');
        const testEmail = `test-${Date.now()}@gmail.com`;
        
        console.log(`📧 Testing with email: ${testEmail}`);
        console.log('⏳ Attempting signup...');
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: 'TestPassword123!',
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: 'Email Test User',
                        phone: '+1234567890',
                        address: 'Test Address',
                        age: '25',
                    },
                },
            });

            if (error) {
                console.error('❌ Signup failed:', error.message);
                console.error('📊 Error details:', error);
                return false;
            }

            if (data.user) {
                console.log('✅ User created successfully!');
                console.log('📊 User data:', {
                    id: data.user.id,
                    email: data.user.email,
                    email_confirmed_at: data.user.email_confirmed_at,
                    created_at: data.user.created_at
                });

                if (!data.user.email_confirmed_at) {
                    console.log('📧 ✅ Confirmation email should have been sent!');
                    console.log(`📬 Check inbox for: ${testEmail}`);
                    return true;
                } else {
                    console.log('⚠️ User email already confirmed (unusual for new signup)');
                    return true;
                }
            } else {
                console.error('❌ No user data returned');
                return false;
            }
        } catch (err) {
            console.error('❌ Unexpected error during signup:', err.message);
            return false;
        }
    },

    checkCommonIssues() {
        console.log('\n4️⃣ Common Issues Checklist...');
        console.log('📋 Please manually verify:');
        console.log('☐ Check spam/junk/promotions folder');
        console.log('☐ Verify email address spelling is correct');
        console.log('☐ Try different email providers (Gmail, Outlook, Yahoo)');
        console.log('☐ Wait 5-10 minutes for delivery');
        console.log('☐ If work email, check with IT administrator');
        console.log('☐ Ensure email provider allows automated emails');
    },

    provideSolutions() {
        console.log('\n5️⃣ Potential Solutions...');
        console.log('🔧 IMMEDIATE FIXES:');
        console.log('1. Gmail App Password Issue (Most Common):');
        console.log('   - Visit: https://myaccount.google.com/security');
        console.log('   - Generate new App Password for Mail');
        console.log('   - Update password in Supabase config');
        console.log('');
        console.log('2. Test with Multiple Email Providers:');
        console.log('   - Gmail: Usually works well');
        console.log('   - Outlook: Good for testing');
        console.log('   - Yahoo: Alternative option');
        console.log('');
        console.log('3. Check Supabase Dashboard:');
        console.log('   - Go to Supabase project dashboard');
        console.log('   - Check Auth logs for errors');
        console.log('   - Verify SMTP settings');
        console.log('');
        console.log('🚀 PRODUCTION RECOMMENDATIONS:');
        console.log('- Switch from Gmail to SendGrid or Mailgun');
        console.log('- Set up dedicated domain for emails');
        console.log('- Configure SPF/DKIM records');
        console.log('- Monitor email delivery rates');
    },

    // Helper function to test specific email address
    async testSpecificEmail(email) {
        console.log(`\n🧪 Testing specific email: ${email}`);
        return await this.testEmailDelivery();
    },

    // Helper function to check current environment
    checkEnvironment() {
        console.log('\n🌍 Environment Information:');
        console.log('URL:', window.location.href);
        console.log('Origin:', window.location.origin);
        console.log('Browser:', navigator.userAgent.split('(')[0].trim());
        console.log('Online:', navigator.onLine);
        console.log('Timestamp:', new Date().toISOString());
    }
};

// Auto-run diagnosis
emailDiagnosis.runFullDiagnosis();

// Make available globally for manual testing
window.emailDiagnosis = emailDiagnosis;

console.log('\n💡 Usage Examples:');
console.log('- emailDiagnosis.runFullDiagnosis() // Run complete diagnosis');
console.log('- emailDiagnosis.testSpecificEmail("your@email.com") // Test specific email');
console.log('- emailDiagnosis.checkEnvironment() // Check environment info');