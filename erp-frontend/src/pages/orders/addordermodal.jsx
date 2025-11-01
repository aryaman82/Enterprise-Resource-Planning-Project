import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchClients } from '../../api/client.api';
import { fetchDesigns } from '../../api/design.api';

/**
 * AddOrderModal - Popup card form for creating or editing an order
 * Props:
 *   open (bool): Whether the modal is visible
 *   onClose (func): Function to close the modal
 *   onSubmit (func): Function to handle form submission
 *   order (object): Optional order object for editing
 */
const AddOrderModal = ({ open, onClose, onSubmit, order }) => {
  const [clients, setClients] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const isEditing = !!order;

  // Fetch clients and designs when modal opens
  useEffect(() => {
    if (open) {
      loadClientsAndDesigns();
    }
  }, [open]);

  const loadClientsAndDesigns = async () => {
    setLoadingData(true);
    try {
      const [clientsData, designsData] = await Promise.all([
        fetchClients(),
        fetchDesigns()
      ]);
      setClients(clientsData);
      setDesigns(designsData);
    } catch (error) {
      console.error('Error loading clients/designs:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Helper function to format date for date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(e);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isEditing ? 'Edit Order' : 'Add New Order'}
        </h2>

        {loadingData ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : (
          /* Form */
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            {/* Client and Design Selection - Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  name="clientId"
                  defaultValue={order ? order.client_id : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No clients available. Please add clients first.</p>
                )}
              </div>

              {/* Design Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design <span className="text-red-500">*</span>
                </label>
                <select
                  name="designId"
                  defaultValue={order ? order.design_id : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select a design</option>
                  {designs.map((design) => (
                    <option key={design.design_id} value={design.design_id}>
                      {design.name}
                    </option>
                  ))}
                </select>
                {designs.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No designs available. Please add designs first.</p>
                )}
              </div>
            </div>

            {/* 2x2 Grid for Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input 
                  type="date" 
                  name="orderDate" 
                  defaultValue={order ? formatDateForInput(order.order_date) : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                  disabled={loading}
                />
              </div>

              {/* Estimated Dispatch Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Dispatch Date</label>
                <input 
                  type="date" 
                  name="dispatchDate" 
                  defaultValue={order ? formatDateForInput(order.dispatch_date) : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  disabled={loading}
                />
              </div>

              {/* Payment Receiving Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Receiving Date</label>
                <input 
                  type="date" 
                  name="paymentDate" 
                  defaultValue={order ? formatDateForInput(order.payment_received_date) : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  disabled={loading}
                />
              </div>

              {/* Invoice Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount</label>
                <input 
                  type="number" 
                  name="invoiceAmount" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  defaultValue={order && order.invoice_amount ? order.invoice_amount : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specs</label>
                <textarea 
                  name="specs" 
                  rows={3} 
                  defaultValue={order ? (order.specs || '') : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  placeholder="Enter specifications..." 
                  disabled={loading}
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea 
                  name="remarks" 
                  rows={3} 
                  defaultValue={order ? (order.remarks || '') : ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  placeholder="Any remarks..." 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                disabled={loading || clients.length === 0 || designs.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Order' : 'Add Order'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddOrderModal;
