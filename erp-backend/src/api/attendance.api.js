const API_URL = 'http://localhost:3001/api/attendance';

export async function getCurrentShiftInstances(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/current-shifts${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || data.error || 'Failed to load current shift');
  return data;
}

export async function getAttendanceForShift({ date, shift_code, outBufferMinutes } = {}) {
  const q = new URLSearchParams();
  if (date) q.set('date', date);
  if (shift_code) q.set('shift_code', shift_code);
  if (outBufferMinutes != null) q.set('outBufferMinutes', String(outBufferMinutes));
  const res = await fetch(`${API_URL}/for-shift?${q.toString()}`);
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || data.error || 'Failed to load attendance');
  return data;
}

export async function getRecentShiftInstances(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/recent-shift-instances${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || data.error || 'Failed to load recent shift instances');
  return data;
}
