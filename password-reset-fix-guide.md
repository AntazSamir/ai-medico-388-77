# Password Reset Troubleshooting Guide

## Issues Fixed ✅

### 1. Port/URL Mismatch (CRITICAL ISSUE)
**Problem**: Supabase config pointed to `http://127.0.0.1:3000` but dev server runs on `http://localhost:8082`

**Solution Applied**:
- Updated `site_url` in `config.toml` to `"http://localhost:8082"`
- Updated `additional_redirect_urls` to match development environment
- Added logging to password reset function for debugging

### 2. Enhanced Error Handling
**Improvements Made**:
- Added console logging to track the exact redirect URL being generated
- Enhanced error handling in `handleForgotPassword` function
- Added debugging information for troubleshooting

## Testing Steps

### Prerequisites
1. **Start Docker Desktop** - Required for Supabase local development
2. **Start Supabase services**: `supabase start`
3. **Start development server**: `npm run dev`

### Testing the Fix
1. Navigate to `http://localhost:8082/login`
2. Click "Forgot password?"
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email for the reset link
6. Click the reset link - it should now take you to `http://localhost:8082/reset-password`

### Verifying the URLs
Check the browser console (F12) when sending a reset email. You should see:
```
Password reset redirect URL: http://localhost:8082/reset-password
```

## Common Issues & Solutions

### Issue: "Site cannot be reached"
**Cause**: URL mismatch between config and actual development server
**Solution**: ✅ Fixed by updating Supabase configuration

### Issue: Docker not running
**Symptom**: `supabase start` fails with Docker connection errors
**Solution**: Start Docker Desktop and ensure it's running

### Issue: Wrong port in reset links
**Symptom**: Reset links point to port 3000 instead of 8082
**Solution**: ✅ Fixed by updating site_url in config.toml

### Issue: Reset page not found
**Symptom**: 404 error when clicking reset links
**Solution**: ✅ Route exists in App.tsx and ResetPassword.tsx component is implemented

## Email Template Configuration ✅

The password reset email template is properly configured:
- Template file: `./templates/recovery.html`
- Subject: "Reset your AI Medico password"
- Contains proper styling and security notices

## Next Steps

1. **Start Docker Desktop**
2. Run `supabase start` to restart services with new configuration
3. Test the password reset flow
4. Monitor browser console for any additional debug information

## Production Deployment Note

When deploying to production, update the configuration to use your production domain:
```toml
site_url = "https://your-production-domain.com"
additional_redirect_urls = ["https://your-production-domain.com"]
```