// src/api/client.api.js
const API_URL = "http://localhost:3001/api/clients";

/**
 * Fetch all clients from the backend
 * @returns {Promise<Array>} Array of client objects
 */
export const fetchClients = async () => {
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
      console.warn("Unexpected response format from fetchClients:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching clients:", err);
    throw err;
  }
};

/**
 * Get single client by ID
 * @param {number} clientId - Client ID
 * @returns {Promise<Object>} Client object
 */
export const getClient = async (clientId) => {
  try {
    const response = await fetch(`${API_URL}/${clientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching client:", error);
    throw error;
  }
};

/**
 * Add a new client
 * @param {Object} clientData Client details to add
 * @returns {Promise<Object>} The newly created client record
 */
export const addClient = async (clientData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("Error adding client:", error);
    throw error;
  }
};

/**
 * Update existing client
 * @param {number} clientId - Client ID
 * @param {Object} clientData - Client data to update
 * @returns {Promise<Object>} Updated client object
 */
export const updateClient = async (clientId, clientData) => {
  try {
    const response = await fetch(`${API_URL}/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update client: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

/**
 * Delete client
 * @param {number} clientId - Client ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteClient = async (clientId) => {
  try {
    const response = await fetch(`${API_URL}/${clientId}`, {
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
      const msg = data?.message || data?.error || `Failed to delete client: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    if (error?.status !== 409) {
      console.error("Error deleting client:", error);
    }
    throw error;
  }
};

