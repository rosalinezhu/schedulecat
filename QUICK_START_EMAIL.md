# Quick Start: Email Reminders

## 1. Install Dependencies
Run the batch file:
```
install-email-dependencies.bat
```

Or manually in PowerShell (if allowed):
```powershell
cd server
npm install nodemailer node-cron
```

## 2. Configure Gmail
1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → App passwords
   - Select "Mail" → Generate
   - Copy the 16-character password

3. **Create .env file** in server folder:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
MONGODB_URI=your-mongodb-connection
JWT_SECRET=your-jwt-secret
```

## 3. Test the System

### Start Server
```bash
cd server
npm start
```

### Check Integration
1. **Login** to your ScheduleCat app
2. **Click "Email Settings"** tab in navigation
3. **Toggle** email reminders on/off
4. **Select** reminder timing (1-48 hours)
5. **Click "Send Test Email"** to verify setup
6. **Save Settings**

### Admin Features
Admins can access additional features in "Admin Settings" → "Email Notifications" tab:
- View email service status
- Manually trigger reminder checks
- Monitor system health

## 4. How It Works
- **Daily Check**: Runs at 9:00 AM automatically
- **Smart Reminders**: Only sends if user has shifts and notifications enabled
- **No Duplicates**: Tracks sent reminders to prevent spam
- **Beautiful Emails**: Professional HTML templates with shift details

## 5. Troubleshooting
- **"Email service disconnected"**: Check .env credentials
- **Test email fails**: Verify Gmail App Password
- **No reminders sent**: Check user has shifts assigned and notifications enabled

The system is now fully integrated into your existing ScheduleCat application!
