// Quick email test without Docker
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmail() {
  console.log('🧪 Testing email confirmation...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'TestPassword123!',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Signup successful!');
      console.log('📧 Check if confirmation email was sent');
      console.log('User:', data.user?.email);
      console.log('Confirmed:', data.user?.email_confirmed_at);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testEmail();
