// shift.api.js
const API_URL = 'http://localhost:3001/api/shifts';

export async function addShift(shiftData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shiftData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add shift');
  }
  return response.json();
}

export async function getAllShifts() {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch shifts');
  }
  return response.json();
}

export async function deleteShift(shiftId) {
  const response = await fetch(`${API_URL}/${shiftId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete shift');
  }
  return response.json();
}
