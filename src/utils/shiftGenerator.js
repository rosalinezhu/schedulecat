// Utility function to generate shifts from shift settings
export function generateShiftsFromSettings(shiftData, weeksAhead = 1) {
  const allShifts = [];
  const today = new Date();
  
  // Add regular shifts for the specified number of weeks
  if (shiftData?.regularShifts) {
    for (let week = 0; week < weeksAhead; week++) {
      shiftData.regularShifts.forEach(shift => {
        shift.days.forEach(dayName => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName);
          const shiftDate = new Date(today);
          shiftDate.setDate(today.getDate() + (week * 7) + (dayIndex - today.getDay()));
          
          const startTime = new Date(shiftDate);
          const [startHour, startMinute] = shift.startTime.split(':').map(Number);
          startTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date(shiftDate);
          const [endHour, endMinute] = shift.endTime.split(':').map(Number);
          endTime.setHours(endHour, endMinute, 0, 0);
          
          allShifts.push({
            id: `regular-${shift.id}-${shiftDate.toDateString()}`,
            type: 'regular',
            name: shift.name,
            day: dayName,
            date: shiftDate.toDateString(),
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            isAvailable: false
          });
        });
      });
    }
  }

  // Add special events
  if (shiftData?.specialEvents) {
    shiftData.specialEvents.forEach(event => {
      if (event.date) {
        // Parse date in local timezone to avoid timezone shift issues
        const [year, month, day] = event.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day); // month is 0-indexed
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][eventDate.getDay()];
        
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);
        
        const startTime = new Date(eventDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(eventDate);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        allShifts.push({
          id: `special-${event.id}`,
          type: 'special',
          name: event.name,
          day: dayName,
          date: eventDate.toDateString(),
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          isAvailable: false
        });
      }
    });
  }

  return allShifts;
}
