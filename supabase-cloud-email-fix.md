# Supabase Cloud Email Configuration Fix

## Problem: Confirmation emails not sending (but password reset works)

## Solution: Update Supabase Cloud Dashboard

### 1. Go to Supabase Dashboard
- URL: https://supabase.com/dashboard
- Select project: lzukcmjplavokrvdocak

### 2. Navigate to Authentication Settings
- Go to: Authentication → Settings → Email
- Or direct link: https://supabase.com/dashboard/project/lzukcmjplavokrvdocak/auth/settings

### 3. Update Email Configuration

#### SMTP Settings:
```
Host: smtp-relay.brevo.com
Port: 587
Username: 96b206001@smtp-brevo.com
Password: dhyZ0XBkI6CmEaNO
Sender name: AI Medico
Sender email: 96b206001@smtp-brevo.com
```

#### Email Templates:
- **Confirmation Email**: Make sure it's enabled
- **Subject**: "Confirm your AI Medico account"
- **Template**: Use the confirmation.html template

### 4. Check These Settings:
- ✅ Enable email confirmations: ON
- ✅ Enable signup: ON
- ✅ Double confirm email changes: ON (optional)
- ✅ Max frequency: 1 second
- ✅ OTP length: 6
- ✅ OTP expiry: 3600 seconds

### 5. Test Email Templates
- Go to Authentication → Email Templates
- Check "Confirm signup" template
- Make sure it has the correct confirmation URL: {{ .ConfirmationURL }}

### 6. Verify Domain Settings
- Check if your domain is properly configured
- Ensure redirect URLs are correct: http://localhost:8081/auth/callback

## Alternative: Use Gmail SMTP

If Brevo continues to have issues, switch to Gmail:

### Gmail SMTP Settings:
```
Host: smtp.gmail.com
Port: 587
Username: rocksamir980@gmail.com
Password: [Gmail App Password - not regular password]
Sender name: AI Medico
Sender email: rocksamir980@gmail.com
```

### To get Gmail App Password:
1. Enable 2-factor authentication on Gmail
2. Go to Google Account settings
3. Security → 2-Step Verification → App passwords
4. Generate password for "Mail"
5. Use this password in Supabase (not your regular Gmail password)

## Test After Changes:
1. Try signing up with a new email
2. Check inbox and spam folder
3. If still not working, check Supabase logs in Dashboard → Logs
