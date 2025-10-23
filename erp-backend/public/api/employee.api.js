export async function fetchEmployees() {
  const res = await fetch('/api/employees');
  return res.json();
}

export async function getEmployee(emp_code) {
  const res = await fetch(`/api/employees/${encodeURIComponent(emp_code)}`);
  return res.json();
}

export async function addEmployee(payload) {
  const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updateEmployee(emp_code, payload) {
  const res = await fetch(`/api/employees/${encodeURIComponent(emp_code)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteEmployee(emp_code, force = false) {
  const res = await fetch(`/api/employees/${encodeURIComponent(emp_code)}${force ? '?force=1' : ''}`, { method: 'DELETE' });
  return res.json();
}

export async function deleteEmployeeForce(emp_code) {
  return deleteEmployee(emp_code, true);
}

export async function getEmployeeDependencies(emp_code) {
  const res = await fetch(`/api/employees/${encodeURIComponent(emp_code)}/dependencies`);
  return res.json();
}
