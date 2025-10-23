export async function getShiftScheduleForMonth(year, month) {
  const res = await fetch(`/api/shift-schedules?year=${year}&month=${month}`);
  return res.json();
}

export async function saveShiftSchedule(payload) {
  const res = await fetch('/api/shift-schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updateShiftAssignment(payload) {
  const res = await fetch('/api/shift-schedules/assignment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}
