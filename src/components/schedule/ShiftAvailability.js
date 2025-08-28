import React, { useState, useEffect } from 'react';
import { getAvailability, saveAvailability } from '../../api/availability';
import CalendarTemplate from '../shared/CalendarTemplate';

export default function ShiftAvailability({ token, isActive, isPreview = false, previewShiftData }) {
  const [shifts, setShifts] = useState([]);
  const [rawShifts, setRawShifts] = useState([]); // Store shifts without availability applied
  const [userAvailability, setUserAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAvailability, setTempAvailability] = useState([]);

  const handleShiftsGenerated = (generatedShifts) => {
    setRawShifts(generatedShifts);
  };

  useEffect(() => {
    if (!token || !isActive) {
      return;
    }
    
    // For preview mode, we don't need to load user availability
    if (isPreview) {
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      try {
        // Only load user availability - shifts will come from CalendarTemplate
        const availabilityData = await getAvailability(token);

        // Apply user availability to shifts
        let availArray = [];
        if (availabilityData) {
          if (Array.isArray(availabilityData)) {
            availArray = availabilityData;
          } else if (availabilityData.shiftAvailability && Array.isArray(availabilityData.shiftAvailability)) {
            availArray = availabilityData.shiftAvailability;
          } else if (availabilityData.availability && availabilityData.availability.shiftAvailability && Array.isArray(availabilityData.availability.shiftAvailability)) {
            availArray = availabilityData.availability.shiftAvailability;
          }
        }
        
        setUserAvailability(availArray);
        setTempAvailability(availArray); 
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set empty data on error to prevent infinite loading
        setUserAvailability([]);
        setTempAvailability([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (!isPreview) {
      loadData();
    }
  }, [token, isActive, isPreview]);

  // Apply availability when rawShifts or userAvailability change
  useEffect(() => {
    if (rawShifts.length > 0) {
      const shiftsWithAvailability = rawShifts.map(shift => ({
        ...shift,
        isAvailable: userAvailability.includes(shift.id)
      }));
      setShifts(shiftsWithAvailability);
    }
  }, [rawShifts, userAvailability]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempAvailability(Array.isArray(userAvailability) ? [...userAvailability] : []);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempAvailability(Array.isArray(userAvailability) ? [...userAvailability] : []);
    // Reset shift availability states
    const availabilityArray = Array.isArray(userAvailability) ? userAvailability : [];
    setShifts(shifts.map(shift => ({
      ...shift,
      isAvailable: availabilityArray.includes(shift.id)
    })));
  };

  const handleSave = async () => {
    try {
      
      // Clear old availability data and save only shift-based data
      const availabilityData = { shiftAvailability: tempAvailability };
      const result = await saveAvailability(token, availabilityData);
      
      setUserAvailability([...tempAvailability]);
      
      // Update shifts to reflect saved availability
      setShifts(shifts.map(shift => ({
        ...shift,
        isAvailable: tempAvailability.includes(shift.id)
      })));
      
      setIsEditing(false);
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Failed to save availability:', error);
      alert('Failed to save availability. Please try again.');
    }
  };

  const toggleShiftAvailability = (shiftId) => {
    if (!isEditing) return;
    
    const availabilityArray = Array.isArray(tempAvailability) ? tempAvailability : [];
    const newAvailability = availabilityArray.includes(shiftId)
      ? availabilityArray.filter(id => id !== shiftId)
      : [...availabilityArray, shiftId];
    
    setTempAvailability(newAvailability);
    
    // Update shift display
    setShifts(shifts.map(shift => ({
      ...shift,
      isAvailable: shift.id === shiftId ? !shift.isAvailable : 
                   newAvailability.includes(shift.id)
    })));
  };

  const groupShiftsByWeek = () => {
    const weeks = {};
    const shiftsArray = Array.isArray(shifts) ? shifts : [];
    shiftsArray.forEach(shift => {
      const shiftDate = new Date(shift.date);
      const weekStart = new Date(shiftDate);
      weekStart.setDate(shiftDate.getDate() - shiftDate.getDay());
      const weekKey = weekStart.toDateString();
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {};
      }
      if (!weeks[weekKey][shift.day]) {
        weeks[weekKey][shift.day] = [];
      }
      weeks[weekKey][shift.day].push(shift);
    });
    return weeks;
  };

  if (loading) {
    return <div>Loading available shifts...</div>;
  }

  const weeklyShifts = groupShiftsByWeek();

  // Convert shifts to calendar events format
  const calendarEvents = shifts.map(shift => ({
    id: shift.id,
    day: shift.day,
    start: shift.start,
    end: shift.end,
    title: shift.name,
    isAvailable: shift.isAvailable,
    isShift: true
  }));

  const handleEventClick = (eventId) => {
    if (isEditing) {
      toggleShiftAvailability(eventId);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: 16 }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>My Availability - Week View</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Click on shift slots to mark your availability. Green = Available, Gray = Not Available
        </p>
        
        {!isEditing && <button onClick={handleEdit} style={{ background: '#7b2ff2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Edit Availability</button>}
        {isEditing && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Save</button>
            <button onClick={handleCancel} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Cancel</button>
          </div>
        )}
      </div>

      {isPreview ? (
        <CalendarTemplate 
          events={calendarEvents}
          onEventClick={handleEventClick}
          isEditing={isEditing}
          token={token}
          previewShiftData={previewShiftData}
          onShiftsGenerated={handleShiftsGenerated}
        />
      ) : loading ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          Loading shifts...
        </div>
      ) : (
        <>
          <CalendarTemplate 
            events={calendarEvents}
            onEventClick={handleEventClick}
            isEditing={isEditing}
            token={token}
            onShiftsGenerated={handleShiftsGenerated}
          />
          {shifts.length === 0 && rawShifts.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No shifts have been set up yet. Contact your admin to add shifts.
            </div>
          )}
        </>
      )}
    </div>
  );
}
