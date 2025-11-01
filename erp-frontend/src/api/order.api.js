// src/api/order.api.js
const API_URL = "http://localhost:3001/api/orders";

/**
 * Fetch all orders from the backend
 * @returns {Promise<Array>} Array of order objects
 */
export const fetchOrders = async () => {
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
      console.warn("Unexpected response format from fetchOrders:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    throw err;
  }
};

/**
 * Get single order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order object
 */
export const getOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

/**
 * Add a new order
 * @param {Object} orderData Order details to add
 * @returns {Promise<Object>} The newly created order record
 */
export const addOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
};

/**
 * Update existing order
 * @param {number} orderId - Order ID
 * @param {Object} orderData - Order data to update
 * @returns {Promise<Object>} Updated order object
 */
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update order: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

/**
 * Delete order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
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
      const msg = data?.message || data?.error || `Failed to delete order: ${response.status} ${response.statusText}`;
      const err = new Error(msg);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    if (error?.status !== 409) {
      console.error("Error deleting order:", error);
    }
    throw error;
  }
};

/**
 * Update order status only
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order object
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${API_URL}/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update order status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

