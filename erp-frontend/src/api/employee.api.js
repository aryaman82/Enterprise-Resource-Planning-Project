// src/api/employee.api.js
const API_URL = "http://localhost:3001/api/employees";

/**
 * Fetch all employees from the backend
 * @returns {Promise<Array>} Array of employee objects
 */
export const fetchEmployees = async () => {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // If backend sends { success, data }, use that, else assume array
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn("Unexpected response format from fetchEmployees:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching employees:", err);
    return [];
  }
};

/**
 * Add a new employee
 * @param {Object} employeeData Employee details to add
 * @returns {Promise<Object>} The newly created employee record
 */
export const addEmployee = async (employeeData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw error with the message from backend
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

// Get single employee by emp_code
export const getEmployee = async (empCode) => {
  try {
    const response = await fetch(`${API_URL}/${empCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If backend sends { success, data }, use data property, else assume it's the employee object
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }
};

// Update existing employee
export const updateEmployee = async (empCode, employeeData) => {
  try {
    const response = await fetch(`${API_URL}/${empCode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update employee: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If backend sends { success, data }, use data property, else assume it's the employee object
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

// Delete employee
export const deleteEmployee = async (empCode) => {
  try {
    const response = await fetch(`${API_URL}/${empCode}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      // ignore JSON parse error
    }

    if (!response.ok) {
      const msg = data?.message || data?.error || `Failed to delete employee: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
  // Avoid noisy logs for expected conflict errors
  if (error?.status !== 409) {
      console.error("Error deleting employee:", error);
    }
    throw error;
  }
};

// Force delete employee (also removes related shiftmapping & ot_approvals)
export const deleteEmployeeForce = async (empCode) => {
  try {
    const response = await fetch(`${API_URL}/${empCode}?force=true`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    let data = null;
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const msg = data?.message || `Failed to hard-delete employee: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
  console.error("Error hard-deleting employee:", error);
    throw error;
  }
};

// Get dependency counts for an employee
export const getEmployeeDependencies = async (empCode) => {
  try {
    const response = await fetch(`${API_URL}/${empCode}/dependencies`, { method: 'GET' });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data?.message || `Failed to get dependencies for ${empCode}`);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data?.data || { shiftSchedules: 0, otApprovals: 0 };
  } catch (error) {
    // Non-fatal; return zeros to keep UX flowing
    return { shiftSchedules: 0, otApprovals: 0 };
  }
};
