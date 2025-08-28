import React, { useEffect, useState } from 'react';
import './custom-group-calendar.css';
import { getCalendarSettings, getShiftSettings } from '../../api/settings';
import { generateShiftsFromSettings } from '../../utils/shiftGenerator';

export default function CalendarTemplate({ events = [], token, slotHeight = 60, groupEvents = false, step, onSlotClick, onEventClick, startHour: propStartHour, endHour: propEndHour, previewShiftData, onShiftsGenerated, ...calendarProps }) {
  const [calendarSettings, setCalendarSettings] = useState({ blockSize: 30, startHour: 8, endHour: 18, availabilityLimit: 2 });
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    const loadSettings = async () => {
      try {
        // Load calendar settings
        const settings = await getCalendarSettings(token);
        if (settings && settings.blockSize !== undefined) {
          setCalendarSettings({
            blockSize: settings.blockSize,
            startHour: settings.startHour,
            endHour: settings.endHour,
            availabilityLimit: settings.availabilityLimit || 2
          });
        }

        // Load and generate shifts
        let generatedShifts = [];
        if (previewShiftData) {
          // Use preview data if provided
          generatedShifts = generateShiftsFromSettings(previewShiftData, 1);
        } else {
          // Load shift settings from API
          const shiftData = await getShiftSettings(token);
          generatedShifts = generateShiftsFromSettings(shiftData, 1);
        }
        
        setShifts(generatedShifts);
        
        // Notify parent component of generated shifts
        if (onShiftsGenerated) {
          onShiftsGenerated(generatedShifts);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [token, previewShiftData]);

  // Use prop values if provided, otherwise use settings
  const startHour = propStartHour !== undefined ? propStartHour : calendarSettings.startHour;
  const endHour = propEndHour !== undefined ? propEndHour : calendarSettings.endHour;
  const stepSize = step !== undefined ? step : calendarSettings.blockSize;

  // Generate actual dates for the current week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek + (weekOffset * 7)); // 7 days = 1 week
  
  const days = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      name: dayNames[i],
      date: date.getDate(),
      fullDate: date.toDateString()
    });
  }
  
  // Get month and year for display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = startOfWeek.getMonth();
  const currentYear = startOfWeek.getFullYear();
  const monthDisplay = `${monthNames[currentMonth]} ${currentYear}`;
  
  // Always generate time slots in 30-minute increments
  const hours = [];
  for (let mins = startHour * 60; mins < endHour * 60; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    hours.push(`${h}:${m.toString().padStart(2, '0')}`);
  }

  // Helper to find event for a given day/time (hour:minute)
  function getEvent(day, hourStr) {
    const [h, m] = String(hourStr).split(':').map(Number);
    
    const foundEvent = events.find(ev => {
      if (ev.day !== day) return false;
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      
      // Use local time comparison to handle timezone correctly
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();
      
      const slotMinutes = h * 60 + m;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
    
    return foundEvent;
  }

  // Helper to check if this is the first slot of an event
  function isEventStart(day, hourStr) {
    const event = getEvent(day, hourStr);
    if (!event) return false;
    
    const [h, m] = String(hourStr).split(':').map(Number);
    const start = new Date(event.start);
    
    // Compare just the time, not the full date
    return h === start.getHours() && m === start.getMinutes();
  }

  // Helper to calculate how many slots an event spans
  function getEventSpan(day, hourStr) {
    const event = getEvent(day, hourStr);
    if (!event) return 1;
    
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationMinutes = (end - start) / (1000 * 60);
    
    return Math.ceil(durationMinutes / 30); // Each slot is 30 minutes
  }

  return (
    <div className="custom-calendar-grid">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px',
        padding: '0 10px'
      }}>
        <button 
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={weekOffset <= 0}
          style={{
            padding: '8px 16px',
            backgroundColor: weekOffset <= 0 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: weekOffset <= 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous Week
        </button>
        <h3 style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold' }}>
          {monthDisplay}
        </h3>
        <button 
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= calendarSettings.availabilityLimit}
          style={{
            padding: '8px 16px',
            backgroundColor: weekOffset >= calendarSettings.availabilityLimit ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: weekOffset >= calendarSettings.availabilityLimit ? 'not-allowed' : 'pointer'
          }}
        >
          Next Week →
        </button>
      </div>
      <div className="calendar-header-row">
        {days.map(day => (
          <div key={day.name} className="calendar-header-cell">
            <div style={{ fontWeight: 'bold' }}>{day.name.slice(0, 3)}</div>
            <div style={{ fontSize: '0.9em', marginTop: '2px' }}>{day.date}</div>
          </div>
        ))}
      </div>
      {hours.map(hour => (
        <div className="calendar-row" key={hour} style={{ height: slotHeight }}>
          <div className="calendar-time-cell time-col">{hour}</div>
          {days.map(day => {
            const [h, m] = String(hour).split(':').map(Number);
            const event = getEvent(day.name, hour);
            return (
              <div
                key={day.name}
                className="calendar-cell"
                tabIndex={0}
                style={{ 
                  cursor: typeof onSlotClick === 'function' ? 'pointer' : 'default',
                  position: 'relative'
                }}
                onClick={() => {
                    if (typeof onSlotClick === 'function') onSlotClick(day.name, h, m);
                  }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && typeof onSlotClick === 'function') onSlotClick(day.name, h, m);
                }}
              >
                {event && isEventStart(day.name, hour) && (
                  <div
                    className="calendar-event"
                    style={{ 
                      height: `${getEventSpan(day.name, hour) * slotHeight}px`,
                      cursor: typeof onEventClick === 'function' ? 'pointer' : 'default',
                      position: 'absolute',
                      width: '100%',
                      zIndex: 1,
                      backgroundColor: groupEvents 
                        ? (event.names && event.names.length > 0 && !event.names.includes('No one available')) 
                          ? '#d4edda' 
                          : '#f8d7da'
                        : event.isAvailable ? '#d4edda' : '#f8f9fa',
                      border: groupEvents 
                        ? (event.names && event.names.length > 0 && !event.names.includes('No one available'))
                          ? '1px solid #c3e6cb'
                          : '1px solid #f5c6cb'
                        : '1px solid #dee2e6',
                      borderRadius: '4px',
                      padding: '4px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start'
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      if (typeof onEventClick === 'function') onEventClick(event.id || event.start);
                    }}
                  >
                    {groupEvents
                      ? <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                            {event.title || 'Shift'}
                          </div>
                          {event.names && event.names.length > 0 && !event.names.includes('No one available') ? (
                            event.names.map((name, idx) => (
                              <div key={idx} style={{ 
                                fontSize: '11px', 
                                padding: '2px 4px', 
                                backgroundColor: 'rgba(40, 167, 69, 0.2)', 
                                borderRadius: '3px',
                                fontWeight: '500',
                                color: '#155724',
                                marginBottom: '1px'
                              }}>
                                {name}
                              </div>
                            ))
                          ) : (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#721c24', 
                              fontWeight: '500',
                              textAlign: 'center',
                              marginTop: '4px'
                            }}>
                              No one available
                            </div>
                          )}
                        </div>
                      : <div className="calendar-event-name" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {event.title || event.names?.[0] || 'Shift'}
                          {event.isAvailable && <div style={{ fontSize: '10px', color: 'green' }}>✓ Available</div>}
                        </div>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}