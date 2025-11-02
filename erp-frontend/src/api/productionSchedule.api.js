// src/api/productionSchedule.api.js
const API_URL = "http://localhost:3001/api/production-schedules";

/**
 * Fetch production schedules (optionally filtered by machineId)
 * @param {number} machineId - Optional machine ID to filter schedules
 * @returns {Promise<Array>} Array of production schedule objects
 */
export const fetchProductionSchedules = async (machineId = null) => {
  try {
    const url = machineId ? `${API_URL}?machineId=${machineId}` : API_URL;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn("Unexpected response format from fetchProductionSchedules:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching production schedules:", err);
    throw err;
  }
};

/**
 * Get single production schedule by ID
 * @param {number} scheduleId - Schedule ID
 * @returns {Promise<Object>} Production schedule object
 */
export const getProductionSchedule = async (scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/${scheduleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch production schedule: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching production schedule:", error);
    throw error;
  }
};

/**
 * Add a new production schedule
 * @param {Object} scheduleData Production schedule details to add
 * @returns {Promise<Object>} The newly created production schedule record
 */
export const addProductionSchedule = async (scheduleData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("Error adding production schedule:", error);
    throw error;
  }
};

/**
 * Update existing production schedule
 * @param {number} scheduleId - Schedule ID
 * @param {Object} scheduleData - Schedule data to update
 * @returns {Promise<Object>} Updated production schedule object
 */
export const updateProductionSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await fetch(`${API_URL}/${scheduleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update production schedule: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating production schedule:", error);
    throw error;
  }
};

/**
 * Delete production schedule
 * @param {number} scheduleId - Schedule ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteProductionSchedule = async (scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/${scheduleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // ignore JSON parse error
    }

    if (!response.ok) {
      const msg = data?.message || data?.error || `Failed to delete production schedule: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error("Error deleting production schedule:", error);
    throw error;
  }
};

