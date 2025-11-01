const API_URL = "http://localhost:3001/api/machines";

export const fetchMachines = async (departmentId = null) => {
  try {
    const url = departmentId ? `${API_URL}?department_id=${departmentId}` : API_URL;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (err) {
    console.error("Error fetching machines:", err);
    throw err;
  }
};

export const getMachine = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch machine: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching machine:", error);
    throw error;
  }
};

export const addMachine = async (machineData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(machineData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data.data || data;
  } catch (error) {
    console.error("Error adding machine:", error);
    throw error;
  }
};

export const updateMachine = async (id, machineData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(machineData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update machine: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error updating machine:", error);
    throw error;
  }
};

export const deleteMachine = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to delete machine: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error("Error deleting machine:", error);
    throw error;
  }
};

