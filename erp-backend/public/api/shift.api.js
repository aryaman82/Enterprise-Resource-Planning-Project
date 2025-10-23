export async function getAllShifts() {
  const res = await fetch('/api/shifts');
  return res.json();
}

export async function addShift(payload) {
  const res = await fetch('/api/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteShift(shift_code) {
  const res = await fetch(`/api/shifts/${encodeURIComponent(shift_code)}`, { method: 'DELETE' });
  return res.json();
}
