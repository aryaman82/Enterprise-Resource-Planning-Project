// src/api/design.api.js
const API_URL = "http://localhost:3001/api/designs";

/**
 * Fetch all designs from the backend
 * @returns {Promise<Array>} Array of design objects
 */
export const fetchDesigns = async () => {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn("Unexpected response format from fetchDesigns:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching designs:", err);
    throw err;
  }
};

/**
 * Get single design by ID
 * @param {number} designId - Design ID
 * @returns {Promise<Object>} Design object
 */
export const getDesign = async (designId) => {
  try {
    const response = await fetch(`${API_URL}/${designId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch design: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching design:", error);
    throw error;
  }
};

/**
 * Add a new design
 * @param {Object} designData Design details to add
 * @returns {Promise<Object>} The newly created design record
 */
export const addDesign = async (designData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(designData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("Error adding design:", error);
    throw error;
  }
};

/**
 * Update existing design
 * @param {number} designId - Design ID
 * @param {Object} designData - Design data to update
 * @returns {Promise<Object>} Updated design object
 */
export const updateDesign = async (designId, designData) => {
  try {
    const response = await fetch(`${API_URL}/${designId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(designData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update design: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error updating design:", error);
    throw error;
  }
};

/**
 * Delete design
 * @param {number} designId - Design ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteDesign = async (designId) => {
  try {
    const response = await fetch(`${API_URL}/${designId}`, {
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
      const msg = data?.message || data?.error || `Failed to delete design: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    if (error?.status !== 409) {
      console.error("Error deleting design:", error);
    }
    throw error;
  }
};

