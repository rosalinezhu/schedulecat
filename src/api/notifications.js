const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getNotificationPreferences = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification preferences');
  }

  return response.json();
};

export const updateNotificationPreferences = async (token, preferences) => {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update notification preferences');
  }

  return response.json();
};

export const sendTestEmail = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/test-reminder`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to send test email');
  }

  return response.json();
};

export const getNotificationStatus = async (token) => {
  const response = await fetch(`${API_BASE_URL}/notifications/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification status');
  }

  return response.json();
};
