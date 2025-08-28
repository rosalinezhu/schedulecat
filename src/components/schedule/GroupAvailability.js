import React, { useEffect, useState } from 'react';
import { getAllAvailabilities } from '../../api/availability';
import CalendarTemplate from '../shared/CalendarTemplate';

export default function GroupAvailability({ token }) {
  const [allAvailabilities, setAllAvailabilities] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleShiftsGenerated = (generatedShifts) => {
    // Add startTime/endTime properties needed by GroupAvailability
    const shiftsWithTimeProps = generatedShifts.map(shift => ({
      ...shift,
      startTime: shift.start ? new Date(shift.start).toTimeString().slice(0, 5) : '',
      endTime: shift.end ? new Date(shift.end).toTimeString().slice(0, 5) : ''
    }));
    
    setShifts(shiftsWithTimeProps);
  };

  useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        const availabilities = await getAllAvailabilities(token);
        setAllAvailabilities(availabilities || []);
      } catch (error) {
        console.error('Failed to load group availability data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  if (loading) {
    return <div>Loading group availability...</div>;
  }

  // Map shifts to events with available users
  const shiftEvents = shifts.map(shift => {
    const availableUsers = [];
    
    // Check each user's availability for this shift
    allAvailabilities.forEach(userAvail => {
      if (!userAvail.userId) return;
      
      // Check multiple possible data structures for availability
      let userShiftAvailability = [];
      
      if (userAvail.availability?.shiftAvailability) {
        userShiftAvailability = userAvail.availability.shiftAvailability;
      } else if (userAvail.shiftAvailability) {
        userShiftAvailability = userAvail.shiftAvailability;
      } else if (Array.isArray(userAvail.availability)) {
        userShiftAvailability = userAvail.availability;
      }
      
      if (userShiftAvailability.includes(shift.id)) {
        const userName = `${userAvail.userId.firstName} ${userAvail.userId.lastName}`;
        availableUsers.push(userName);
      }
    });


    return {
      id: shift.id,
      day: shift.day,
      start: shift.start,
      end: shift.end,
      title: shift.name,
      names: availableUsers.length > 0 ? availableUsers : ['No one available'],
      type: shift.type
    };
  });


  return (
    <div>
      <h3>Group Availability - Shift Coverage</h3>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        Shows which team members are available for each shift
      </p>
      <CalendarTemplate
        events={shiftEvents}
        token={token}
        groupEvents={true}
        onShiftsGenerated={handleShiftsGenerated}
      />
    </div>
  );
}
