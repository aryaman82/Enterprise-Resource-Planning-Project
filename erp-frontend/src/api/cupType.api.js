const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Fetch all cup types
 */
export const fetchCupTypes = async () => {
  const response = await fetch(`${API_BASE_URL}/cup-types`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch cup types');
  }
  
  return result.data;
};

/**
 * Fetch a single cup type by ID
 */
export const getCupType = async (id) => {
  const response = await fetch(`${API_BASE_URL}/cup-types/${id}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch cup type');
  }
  
  return result.data;
};

/**
 * Create a new cup type
 */
export const addCupType = async (cupTypeData) => {
  const response = await fetch(`${API_BASE_URL}/cup-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cupTypeData),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    const error = new Error(result.message || 'Failed to create cup type');
    error.status = response.status;
    throw error;
  }
  
  return result.data;
};

/**
 * Update an existing cup type
 */
export const updateCupType = async (id, cupTypeData) => {
  const response = await fetch(`${API_BASE_URL}/cup-types/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cupTypeData),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    const error = new Error(result.message || 'Failed to update cup type');
    error.status = response.status;
    throw error;
  }
  
  return result.data;
};

/**
 * Delete a cup type
 */
export const deleteCupType = async (id) => {
  const response = await fetch(`${API_BASE_URL}/cup-types/${id}`, {
    method: 'DELETE',
  });
  
  const result = await response.json();
  
  if (!result.success) {
    const error = new Error(result.message || 'Failed to delete cup type');
    error.status = response.status;
    throw error;
  }
  
  return result.data;
};

