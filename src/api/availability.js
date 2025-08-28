const API_URL = 'http://localhost:5000/api/availability'

export async function getAvailability(token) {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

export async function saveAvailability(token, availability) {
    console.log('API call - saving availability:', availability);
    console.log('API call - token exists:', !!token);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(availability)
    });
    
    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    return data;
}

export async function getAllAvailabilities(token) {
    const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    return data;
}