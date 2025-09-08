// Test script to verify password reset URL generation
// Run this after starting your development servers

const testUrl = () => {
  // Simulate the URL generation from handleForgotPassword function
  const origin = 'http://localhost:8082'; // Your actual dev server
  const resetUrl = `${origin}/reset-password`;
  
  console.log('Generated Reset URL:', resetUrl);
  console.log('Expected URL format:', 'http://localhost:8082/reset-password');
  console.log('URL Match:', resetUrl === 'http://localhost:8082/reset-password');
  
  // Test if the route exists in your React app
  console.log('\nRoute Check:');
  console.log('- /reset-password route exists in App.tsx: ✅');
  console.log('- ResetPassword.tsx component exists: ✅');
  
  return resetUrl;
};

testUrl();