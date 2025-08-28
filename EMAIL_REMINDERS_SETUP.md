# Email Reminder System Setup Guide

## Overview
The email reminder system automatically sends shift reminders to users based on their availability and preferences. It uses Gmail (free) for sending emails and runs daily checks for upcoming shifts.

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install nodemailer node-cron
```

### 2. Gmail Configuration (Free Option)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to Security > App passwords
2. Select "Mail" as the app
3. Copy the 16-character password generated

#### Step 3: Environment Variables
Create/update your `.env` file in the server directory:
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

### 3. Database Models
The system includes:
- **User model**: Extended with `emailNotifications` preferences
- **ShiftAssignment model**: Tracks shift assignments and reminder status

### 4. API Endpoints
- `GET /api/notifications/preferences` - Get user notification settings
- `PUT /api/notifications/preferences` - Update notification settings
- `POST /api/notifications/test-reminder` - Send test email
- `GET /api/notifications/status` - Check email service status
- `POST /api/notifications/trigger-reminders` - Manual trigger (admin only)

## Frontend Integration

### 1. Notification Settings Component
Import and use the `NotificationSettings` component:
```javascript
import NotificationSettings from './components/NotificationSettings';

// In your settings page or user dashboard
<NotificationSettings token={userToken} />
```

### 2. API Functions
The system includes API functions in `src/api/notifications.js` for:
- Getting/updating preferences
- Sending test emails
- Checking service status

## Features

### Email Templates
- **Shift Reminders**: Beautiful HTML emails with shift details
- **Test Emails**: Simple confirmation emails
- **Responsive Design**: Works on all email clients

### Scheduling Options
Users can choose reminder timing:
- 1 hour before shift
- 2 hours before shift
- 6 hours before shift
- 12 hours before shift
- 24 hours before shift (default)
- 48 hours before shift

### Cron Job Scheduler
- Runs daily at 9:00 AM
- Checks for shifts requiring reminders
- Prevents duplicate reminders
- Handles errors gracefully

## Usage

### For Users
1. Navigate to notification settings
2. Toggle shift reminders on/off
3. Select preferred reminder timing
4. Test email functionality
5. Save preferences

### For Admins
1. Configure email environment variables
2. Monitor service status
3. Manually trigger reminder checks if needed
4. View system logs for troubleshooting

## Troubleshooting

### Email Service Issues
- Verify Gmail credentials are correct
- Check 2-Factor Authentication is enabled
- Ensure App Password is properly generated
- Check firewall/network restrictions

### Common Error Messages
- "Email service not configured": Missing environment variables
- "Authentication failed": Incorrect Gmail credentials
- "Scheduler not running": Email service verification failed

### Testing
1. Use the "Send Test Email" button in settings
2. Check server logs for detailed error messages
3. Verify email appears in spam folder if not in inbox

## Security Considerations
- Uses Gmail App Passwords (more secure than regular passwords)
- Environment variables keep credentials secure
- JWT authentication for all API endpoints
- No sensitive data stored in database

## Cost
This implementation is completely **FREE** using:
- Gmail (free tier: 15GB storage, sufficient for email sending)
- Node.js libraries (open source)
- No external paid services required

## Future Enhancements
- SMS reminders
- Multiple reminder times per user
- Shift change notifications
- Bulk reminder management for admins
- Email templates customization
