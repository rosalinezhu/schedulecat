const API_URL = 'http://localhost:5000/api/settings';

export async function getCalendarSettings(token) {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function saveCalendarSettings(token, settings) {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function getShiftSettings(token) {
  const res = await fetch(`${API_URL}/shifts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function saveShiftSettings(token, shiftSettings) {
  const res = await fetch(`${API_URL}/shifts`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(shiftSettings)
  });
  return res.json();
}
