import React from 'react';
import { X } from 'lucide-react';

/**
 * AddOrderModal - Popup card form for creating a new order
 * Props:
 *   open (bool): Whether the modal is visible
 *   onClose (func): Function to close the modal
 *   onSubmit (func): Function to handle form submission
 */
const AddOrderModal = ({ open, onClose, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add New Order</h2>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            if (onSubmit) onSubmit(e);
          }}
        >
          {/* 2x2 Grid for Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
              <input 
                type="date" 
                name="orderDate" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>

            {/* Estimated Dispatch Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Dispatch Date</label>
              <input 
                type="date" 
                name="dispatchDate" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>

            {/* Payment Receiving Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Receiving Date</label>
              <input 
                type="date" 
                name="paymentDate" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                placeholder="Enter specifications..." 
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                name="remarks" 
                rows={3} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                placeholder="Any remarks..." 
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
