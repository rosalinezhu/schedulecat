import React, { useState, useEffect } from 'react';
import ShiftManager from './ShiftManager';
import ShiftAvailability from '../schedule/ShiftAvailability';
import NotificationSettings from '../shared/NotificationSettings';
import { saveCalendarSettings, getCalendarSettings } from '../../api/settings';

export default function AdminSettings() {
  const [availabilityLimit, setAvailabilityLimit] = useState(2); // weeks ahead
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [shiftData, setShiftData] = useState({ regularShifts: [], specialEvents: [] });
  const [savedShiftData, setSavedShiftData] = useState({ regularShifts: [], specialEvents: [] });
  const [activeTab, setActiveTab] = useState('shifts');
  
  // Load current settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const settings = await getCalendarSettings(token);
          if (settings && settings.availabilityLimit !== undefined) {
            setAvailabilityLimit(settings.availabilityLimit);
          }
          // Reset unsaved changes flag after loading
          setHasUnsavedChanges(false);
          
          // Load saved shift data for preview
          try {
            const { getShiftSettings } = await import('../api/settings');
            const shiftSettings = await getShiftSettings(token);
            if (shiftSettings) {
              setSavedShiftData(shiftSettings);
            }
          } catch (shiftError) {
            console.log('No saved shifts found, using empty state');
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Set default values on error to prevent infinite loading
        setAvailabilityLimit(4);
        setShiftData({ regularShifts: [], specialEvents: [] });
        setHasUnsavedChanges(false);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);
  

  // Empty events array for preview - calendar will be interactive
  const previewEvents = [];

  const [error, setError] = useState('');
  const handleSaveSettings = async () => {
    setSaved(false);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const result = await saveCalendarSettings(token, { availabilityLimit });
      if (result) {
        setSaved(true);
        // Reset unsaved changes flag after successful save
        setHasUnsavedChanges(false);
        
        // Save shift data and update preview
        try {
          const { saveShiftSettings } = await import('../api/settings');
          await saveShiftSettings(token, shiftData);
          setSavedShiftData({ ...shiftData });
        } catch (shiftError) {
          console.log('Failed to save shifts, but calendar settings saved');
        }
        
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError('Failed to save settings');
      }
    } catch (e) {
      setError('Failed to save settings');
    }
  };


  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h2>Admin Settings</h2>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #eee' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('shifts')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'shifts' ? '#7b2ff2' : 'transparent',
              color: activeTab === 'shifts' ? 'white' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'shifts' ? 'bold' : 'normal',
              borderBottom: activeTab === 'shifts' ? '2px solid #7b2ff2' : '2px solid transparent'
            }}
          >
            Shift Management
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'notifications' ? '#7b2ff2' : 'transparent',
              color: activeTab === 'notifications' ? 'white' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeTab === 'notifications' ? 'bold' : 'normal',
              borderBottom: activeTab === 'notifications' ? '2px solid #7b2ff2' : '2px solid transparent'
            }}
          >
            Email Notifications
          </button>
        </div>
      </div>

      {activeTab === 'shifts' && (
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <div style={{marginTop:12, flex: 1, maxWidth: '400px' }}>
          <div style={{ marginBottom: '12px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Availability Limit (weeks ahead):
              </label>
              <select 
                value={availabilityLimit} 
                onChange={(e) => {
                  setAvailabilityLimit(parseInt(e.target.value));
                  setHasUnsavedChanges(true);
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value={1}>1 week</option>
                <option value={2}>2 weeks</option>
                <option value={3}>3 weeks</option>
                <option value={4}>4 weeks</option>
                <option value={6}>6 weeks</option>
                <option value={8}>8 weeks</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <ShiftManager 
              token={localStorage.getItem('token')} 
              hideTitle={true}
              shiftData={shiftData}
              onShiftDataChange={setShiftData}
            />
          </div>

          <div style={{ textAlign: 'center', padding: '16px', borderTop: '2px solid #007bff' }}>
            <button 
              type="button" 
              className="btn" 
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }} 
              onClick={handleSaveSettings}
            >
              Save All Settings
            </button>
            {saved && <div style={{color: 'green', marginTop: 8, fontWeight: 'bold'}}>✓ Settings Saved!</div>}
            {error && <div style={{color: 'red', marginTop: 8, fontWeight: 'bold'}}>✗ {error}</div>}
            {hasUnsavedChanges && !saved && <div style={{color: '#ff6b35', marginTop: 8, fontSize: '0.9em'}}>⚠️ You have unsaved changes</div>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '500px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2em' }}>Shift Preview</h3>
          <div style={{ 
            background: '#f6fff2', 
            borderRadius: '8px', 
            padding: '16px', 
            border: '1px solid #ddd', 
            fontSize: '0.9em',
            height: '550px',
            overflow: 'auto'
          }}>
            <div style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142.8%', height: '142.8%' }}>
              <ShiftAvailability
                token={localStorage.getItem('token')}
                isActive={true}
                isPreview={true}
                previewShiftData={shiftData}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'notifications' && (
        <div style={{ maxWidth: '800px' }}>
          <NotificationSettings token={localStorage.getItem('token')} />
        </div>
      )}
    </div>
  );
}
