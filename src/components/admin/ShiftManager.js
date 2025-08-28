import React, { useState, useEffect } from 'react';
import { saveShiftSettings, getShiftSettings } from '../../api/settings';

export default function ShiftManager({ shiftData, onShiftDataChange }) {
  const [regularShifts, setRegularShifts] = useState(shiftData?.regularShifts || []);
  const [specialEvents, setSpecialEvents] = useState(shiftData?.specialEvents || []);
  const [loading, setLoading] = useState(true);
  const [collapsedShifts, setCollapsedShifts] = useState(new Set());
  const [collapsedEvents, setCollapsedEvents] = useState(new Set());

  // Update parent component when shifts change
  useEffect(() => {
    if (onShiftDataChange) {
      onShiftDataChange({ regularShifts, specialEvents });
    }
  }, [regularShifts, specialEvents, onShiftDataChange]);

  // Load existing shift settings
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const token = localStorage.getItem('token');
        const shiftSettings = await getShiftSettings(token);
        if (shiftSettings) {
          setRegularShifts(shiftSettings.regularShifts || []);
          setSpecialEvents(shiftSettings.specialEvents || []);
          
          // Collapse all loaded shifts and events (they are saved)
          const shiftIds = new Set((shiftSettings.regularShifts || []).map(shift => shift.id));
          const eventIds = new Set((shiftSettings.specialEvents || []).map(event => event.id));
          setCollapsedShifts(shiftIds);
          setCollapsedEvents(eventIds);
        }
      } catch (error) {
        console.error('Failed to load shift settings:', error);
        // If endpoint doesn't exist, start with empty arrays
        setRegularShifts([]);
        setSpecialEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadShifts();
  }, []);

  const addRegularShift = () => {
    // Check if there's already an unsaved shift (expanded and incomplete)
    const hasUnsavedShift = regularShifts.some(shift => 
      !collapsedShifts.has(shift.id) && (!shift.name || shift.days.length === 0)
    );
    
    if (hasUnsavedShift) {
      alert('Please save or complete the current shift before adding a new one.');
      return;
    }
    
    const newShiftId = Date.now();
    
    // Collapse ALL existing shifts before adding new one
    setCollapsedShifts(prev => {
      const newSet = new Set();
      regularShifts.forEach(shift => {
        newSet.add(shift.id);
      });
      // Keep new shift expanded
      newSet.delete(newShiftId);
      return newSet;
    });
    
    // Add the new shift
    setRegularShifts(prev => [...prev, {
      id: newShiftId,
      name: 'New Shift',
      startTime: '09:00',
      endTime: '11:00',
      days: []
    }]);
  };

  const updateRegularShift = (id, field, value) => {
    setRegularShifts(regularShifts.map(shift => 
      shift.id === id ? { ...shift, [field]: value } : shift
    ));
  };

  const toggleAllDays = (shiftId, selectAll) => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    updateRegularShift(shiftId, 'days', selectAll ? allDays : []);
  };

  const toggleShiftCollapse = (shiftId) => {
    setCollapsedShifts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shiftId)) {
        newSet.delete(shiftId);
      } else {
        newSet.add(shiftId);
      }
      return newSet;
    });
  };

  const saveRegularShift = (id) => {
    // Collapse the shift after saving
    setCollapsedShifts(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const removeRegularShift = (id) => {
    setRegularShifts(regularShifts.filter(shift => shift.id !== id));
  };

  const saveSpecialEvent = (id) => {
    // Collapse the event after saving
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const toggleEventCollapse = (eventId) => {
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const addSpecialEvent = () => {
    // Check if there's already an unsaved event (expanded and incomplete)
    const hasUnsavedEvent = specialEvents.some(event => 
      !collapsedEvents.has(event.id) && (!event.name || !event.date)
    );
    
    if (hasUnsavedEvent) {
      alert('Please save or complete the current event before adding a new one.');
      return;
    }
    
    const newEventId = Date.now();
    
    // Collapse ALL existing events before adding new one
    setCollapsedEvents(prev => {
      const newSet = new Set();
      specialEvents.forEach(event => {
        newSet.add(event.id);
      });
      // Keep new event expanded
      newSet.delete(newEventId);
      return newSet;
    });
    
    setSpecialEvents([...specialEvents, {
      id: newEventId,
      name: 'Special Event',
      date: '',
      startTime: '15:00',
      endTime: '19:00'
    }]);
  };

  const updateSpecialEvent = (id, field, value) => {
    setSpecialEvents(specialEvents.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  const removeSpecialEvent = (id) => {
    setSpecialEvents(specialEvents.filter(event => event.id !== id));
  };


  if (loading) {
    return <div>Loading shift settings...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Shift Management</h2>
      
      {/* Regular Shifts Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Regular Shifts</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Define recurring shifts that happen on specific days each week
        </p>
        
        {regularShifts.map(shift => {
          const isCollapsed = collapsedShifts.has(shift.id);
          const hasValidData = shift.name && shift.days.length > 0;
          
          return (
          <div key={shift.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: isCollapsed ? '10px' : '15px', 
            marginBottom: '10px',
            background: '#f9f9f9'
          }}>
            {isCollapsed ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  <strong>{shift.name}</strong> • {shift.startTime}-{shift.endTime} • {shift.days.join(', ')}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => toggleShiftCollapse(shift.id)}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => removeRegularShift(shift.id)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>Shift Details</h4>
                  {hasValidData && (
                    <button 
                      onClick={() => toggleShiftCollapse(shift.id)}
                      style={{ background: '#28a745', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                    >
                      Collapse
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label>Shift Name:</label>
                    <input 
                      type="text" 
                      value={shift.name}
                      onChange={e => updateRegularShift(shift.id, 'name', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                  
                  <div>
                    <label>Start:</label>
                    <input 
                      type="time" 
                      value={shift.startTime}
                      onChange={e => updateRegularShift(shift.id, 'startTime', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                  
                  <div>
                    <label>End:</label>
                    <input 
                      type="time" 
                      value={shift.endTime}
                      onChange={e => updateRegularShift(shift.id, 'endTime', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <label>Days:</label>
                    <button 
                      type="button"
                      onClick={() => toggleAllDays(shift.id, shift.days.length !== 7)}
                      style={{ 
                        background: shift.days.length === 7 ? '#28a745' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.8em'
                      }}
                    >
                      {shift.days.length === 7 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={shift.days.includes(day)}
                          onChange={e => {
                            const newDays = e.target.checked 
                              ? [...shift.days, day]
                              : shift.days.filter(d => d !== day);
                            updateRegularShift(shift.id, 'days', newDays);
                          }}
                        />
                        <span style={{ marginLeft: '3px', fontSize: '0.9em' }}>{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button 
                    onClick={() => saveRegularShift(shift.id)}
                    disabled={!shift.name || shift.days.length === 0}
                    style={{ 
                      background: (!shift.name || shift.days.length === 0) ? '#ccc' : '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      cursor: (!shift.name || shift.days.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Save Shift
                  </button>
              </>
            )}
          </div>
          );
        })}
        
        <button 
          onClick={addRegularShift}
          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px' }}
        >
          Add Regular Shift
        </button>
      </div>

      {/* Special Events Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Special Events</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Define one-time events for specific dates
        </p>
        
        {specialEvents.map(event => {
          const isCollapsed = collapsedEvents.has(event.id);
          const hasValidData = event.name && event.date;
          
          return (
          <div key={event.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: isCollapsed ? '10px' : '15px', 
            marginBottom: '10px',
            background: '#f0f8ff'
          }}>
            {isCollapsed ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  <strong>{event.name}</strong> • {event.date} • {event.startTime}-{event.endTime}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => toggleEventCollapse(event.id)}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => removeSpecialEvent(event.id)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>Event Details</h4>
                  {hasValidData && (
                    <button 
                      onClick={() => toggleEventCollapse(event.id)}
                      style={{ background: '#28a745', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em' }}
                    >
                      Collapse
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label>Event Name:</label>
                    <input 
                      type="text" 
                      value={event.name}
                      onChange={e => updateSpecialEvent(event.id, 'name', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                  
                  <div>
                    <label>Date:</label>
                    <input 
                      type="date" 
                      value={event.date}
                      onChange={e => updateSpecialEvent(event.id, 'date', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                  
                  <div>
                    <label>Start:</label>
                    <input 
                      type="time" 
                      value={event.startTime}
                      onChange={e => updateSpecialEvent(event.id, 'startTime', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                  
                  <div>
                    <label>End:</label>
                    <input 
                      type="time" 
                      value={event.endTime}
                      onChange={e => updateSpecialEvent(event.id, 'endTime', e.target.value)}
                      style={{ marginLeft: '5px', padding: '5px' }}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => saveSpecialEvent(event.id)}
                  disabled={!event.name || !event.date}
                  style={{ 
                    background: (!event.name || !event.date) ? '#ccc' : '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px',
                    cursor: (!event.name || !event.date) ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Save Event
                </button>
              </>
            )}
          </div>
          );
        })}
        
        <button 
          onClick={addSpecialEvent}
          style={{ background: '#2196F3', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px' }}
        >
          Add Special Event
        </button>
      </div>

    </div>
  );
}
