const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.isConfigured = false;
    this.senderEmail = null;
    this.resend = null;
    this.initializeService();
  }

  initializeService() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.senderEmail = process.env.SENDER_EMAIL;

    if (apiKey && this.senderEmail) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      console.log('✅ SendGrid email service initialized');
      console.log('📧 Sender email:', this.senderEmail);
    } else {
      console.log('⚠️ Email service not configured. Missing SENDGRID_API_KEY or SENDER_EMAIL');
    }
  }

  async sendWeeklySummary(userEmail, userName, weeklyShifts) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    let shiftsHtml = '';
    if (weeklyShifts && weeklyShifts.length > 0) {
      shiftsHtml = weeklyShifts.map(shift => {
        const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
        return `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #7b2ff2;">
            <h4 style="color: #7b2ff2; margin: 0 0 8px 0;">${shift.shiftName}</h4>
            <p style="margin: 3px 0; color: #333;"><strong>📅 ${shiftDate}</strong></p>
            <p style="margin: 3px 0; color: #666;">⏰ ${shift.startTime} - ${shift.endTime}</p>
          </div>
        `;
      }).join('');
    } else {
      shiftsHtml = `
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; color: #2d5a2d;">
          <p style="margin: 0; font-size: 16px;">🎉 No shifts scheduled this week - enjoy your free time!</p>
        </div>
      `;
    }

    const msg = {
      to: userEmail,
      from: this.senderEmail,
      subject: `Weekly Schedule Summary - ${weekRange}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7b2ff2, #f093fb); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📅 Weekly Schedule</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${weekRange}</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
            
            <p style="color: #666; font-size: 16px;">
              Here's your schedule summary for this week:
            </p>
            
            <div style="margin: 25px 0;">
              ${shiftsHtml}
            </div>
            
            ${weeklyShifts && weeklyShifts.length > 0 ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>📝 Remember:</strong> If you need to make changes to your availability, please contact your administrator as soon as possible.
                </p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
              <p>This is your weekly schedule summary from ScheduleCat.</p>
              <p>To update your notification preferences, log into your account.</p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const response = await sgMail.send(msg);
      console.log('Weekly summary email sent via SendGrid');
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Failed to send weekly summary email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestEmail(userEmail, userName) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const msg = {
      to: userEmail,
      from: this.senderEmail,
      subject: 'Test Email from ScheduleCat',
      html: `<strong>Hi ${userName}!</strong><br>This is a test email from your ScheduleCat application.`
    };

    try {
      console.log('Sending test email to:', userEmail);
      console.log('From email:', msg.from);
      const response = await sgMail.send(msg);
      console.log('✅ SendGrid response:', response[0].statusCode);
      console.log('📧 Message ID:', response[0].headers['x-message-id']);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyConnection() {
    if (!this.isConfigured) {
      console.log('Email service not initialized - SendGrid credentials missing');
      return false;
    }
    
    console.log('SendGrid email service ready');
    return true;
  }
}

module.exports = new EmailService();
