# Fix Email Deliverability - Stop Going to Spam

## Problem: Password reset emails going to spam as "dangerous mail"

## Root Causes:
1. **Sender domain looks suspicious**: `96b206001@smtp-brevo.com`
2. **Missing email authentication** (SPF, DKIM, DMARC)
3. **Content triggers spam filters**
4. **From/Reply address mismatch**

## Solutions:

### 1. Use Your Own Domain (Recommended)
Instead of `96b206001@smtp-brevo.com`, use your own domain:

```
From Email: noreply@yourdomain.com
Reply To: support@yourdomain.com
```

### 2. Fix Brevo Configuration
Update your Supabase SMTP settings:

```
Host: smtp-relay.brevo.com
Port: 587
Username: your-brevo-email@yourdomain.com
Password: your-brevo-password
Sender Name: AI Medico
From Email: noreply@yourdomain.com
Reply To: support@yourdomain.com
```

### 3. Set Up Email Authentication
Add these DNS records to your domain:

#### SPF Record:
```
TXT: v=spf1 include:spf.brevo.com ~all
```

#### DKIM Record:
- Get DKIM key from Brevo dashboard
- Add as CNAME record

#### DMARC Record:
```
TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### 4. Improve Email Content
Update email templates to be less "spammy":

#### Current (Triggers Spam):
```
Subject: "Reset your AI Medico password"
Content: "Click here to reset your password"
```

#### Better (Less Spammy):
```
Subject: "Your AI Medico account security update"
Content: "We received a request to update your account security. If this was you, please use the link below to continue."
```

### 5. Alternative: Use Gmail SMTP
If you can't set up domain authentication:

```
Host: smtp.gmail.com
Port: 587
Username: rocksamir980@gmail.com
Password: [Gmail App Password]
From Email: rocksamir980@gmail.com
Reply To: rocksamir980@gmail.com
```

### 6. Test Email Deliverability
Use these tools to test:
- https://www.mail-tester.com/
- https://mxtoolbox.com/spamcheck.aspx
- https://postmaster.google.com/

## Quick Fix for Now:
1. Check spam folder regularly
2. Add `noreply@yourdomain.com` to contacts
3. Mark emails as "Not Spam" in Gmail
4. Use Gmail SMTP as temporary solution
