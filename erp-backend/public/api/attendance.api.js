export async function getAttendanceForShift({ date, shift_code, outBufferMinutes } = {}) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (shift_code) params.append('shift_code', shift_code);
  if (outBufferMinutes) params.append('outBufferMinutes', String(outBufferMinutes));
  const res = await fetch(`/api/attendance/for-shift?${params.toString()}`);
  return res.json();
}
