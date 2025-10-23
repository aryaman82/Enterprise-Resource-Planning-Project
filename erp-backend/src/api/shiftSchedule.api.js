const API_URL = "http://localhost:3001/api/shift-schedules";

export const getShiftScheduleForMonth = async (year, month) => {
  try {
    const response = await fetch(`${API_URL}?year=${year}&month=${month}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching shift schedule:', error);
    throw new Error('Failed to fetch shift schedule');
  }
};

export const saveShiftSchedule = async (scheduleData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving shift schedule:', error);
    throw new Error('Failed to save shift schedule');
  }
};

export const updateShiftAssignment = async (employeeId, date, shiftCode) => {
  try {
    const response = await fetch(`${API_URL}/assignment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId,
        date,
        shiftCode
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating shift assignment:', error);
    throw new Error('Failed to update shift assignment');
  }
};
