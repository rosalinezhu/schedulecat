import React, { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences, sendTestEmail, getNotificationStatus } from '../../api/notifications';
import './NotificationSettings.css';

export default function NotificationSettings({ token }) {
  const [preferences, setPreferences] = useState({
    weeklySummary: true
  });
  const [status, setStatus] = useState({
    emailService: 'disconnected',
    schedulerRunning: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [message, setMessage] = useState('');


  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefsData, statusData] = await Promise.all([
        getNotificationPreferences(token),
        getNotificationStatus(token)
      ]);
      
      setPreferences(prefsData.emailNotifications || {
        weeklySummary: true
      });
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to load notification data:', error);
      setMessage('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(token, preferences);
      setMessage('Notification preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestEmailSending(true);
      await sendTestEmail(token);
      setMessage('Test email sent! Check your inbox.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Failed to send test email:', error);
      setMessage('Failed to send test email. Please check your email configuration.');
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleToggleSummary = (enabled) => {
    setPreferences(prev => ({
      ...prev,
      weeklySummary: enabled
    }));
  };

  if (loading) {
    return (
      <div className="notification-settings loading">
        <div>Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h3>Email Notification Settings</h3>
        <div className="service-status">
          <span className={`status-indicator ${status.emailService === 'connected' ? 'connected' : 'disconnected'}`}>
            Email Service: {status.emailService}
          </span>
          <span className={`status-indicator ${status.schedulerRunning ? 'running' : 'stopped'}`}>
            Scheduler: {status.schedulerRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="settings-section">
        <div className="setting-item">
          <div className="setting-header">
            <h4>Weekly Schedule Summary</h4>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.weeklySummary}
                onChange={(e) => handleToggleSummary(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
          <p className="setting-description">
            Receive a weekly email summary of your upcoming shifts
          </p>
        </div>

        {preferences.weeklySummary && (
          <div className="setting-item schedule-info">
            <div className="info-box">
              <h4>📅 Email Schedule</h4>
              <p>You will receive your weekly schedule summary every <strong>Sunday at 9:00 AM</strong>.</p>
              <p>The email will include all your shifts for the upcoming week (Sunday - Saturday).</p>
            </div>
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        <button
          onClick={handleTestEmail}
          disabled={testEmailSending || status.emailService !== 'connected'}
          className="test-button"
        >
          {testEmailSending ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {status.emailService !== 'connected' && (
        <div className="email-setup-notice">
          <h4>Email Service Setup Required</h4>
          <p>To enable weekly summaries, your administrator needs to configure the email service with:</p>
          <ul>
            <li>SENDGRID_API_KEY environment variable</li>
            <li>SENDER_EMAIL environment variable</li>
          </ul>
        </div>
      )}
    </div>
  );
}
