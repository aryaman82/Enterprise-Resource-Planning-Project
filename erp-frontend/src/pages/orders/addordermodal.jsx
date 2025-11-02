import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { fetchClients } from '../../api/client.api';
import { fetchCupTypes } from '../../api/cupType.api';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from './components/CustomDropdown';
import LabeledInput from './components/LabeledInput';

/**
 * AddOrderModal - Popup card form for creating or editing an order
 * Props:
 *   open (bool): Whether the modal is visible
 *   onClose (func): Function to close the modal
 *   onSubmit (func): Function to handle form submission
 *   order (object): Optional order object for editing
 */
const AddOrderModal = ({ open, onClose, onSubmit, order }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [cupTypes, setCupTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(order ? order.client_id : '');
  const [selectedCupSpecsId, setSelectedCupSpecsId] = useState(order ? order.cup_specs_id : '');

  const isEditing = !!order;

  // Fetch clients and cup types when modal opens
  useEffect(() => {
    if (open) {
      loadClientsAndCupTypes();
      if (order) {
        setSelectedClientId(order.client_id || '');
        setSelectedCupSpecsId(order.cup_specs_id || '');
      } else {
        setSelectedClientId('');
        setSelectedCupSpecsId('');
      }
    }
  }, [open, order]);

  const loadClientsAndCupTypes = async () => {
    setLoadingData(true);
    try {
      const [clientsData, cupTypesData] = await Promise.all([
        fetchClients(),
        fetchCupTypes()
      ]);
      setClients(clientsData);
      setCupTypes(cupTypesData);
    } catch (error) {
      console.error('Error loading clients/cup types:', error);
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
            {/* New Cup Type Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/admin?tab=cup-types');
                }}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md flex items-center mb-2 transition-colors duration-200"
                disabled={loading}
              >
                <Plus className="h-3 w-3 mr-1" />
                New Cup Type
              </button>
            </div>

            {/* Client and Cup Type Selection - Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  name="clientId"
                  value={selectedClientId}
                  options={clients.map(client => ({
                    value: client.client_id,
                    label: client.name
                  }))}
                  placeholder="Select a client"
                  required
                  disabled={loading || clients.length === 0}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
                {clients.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No clients available. Please add clients first.</p>
                )}
              </div>

              {/* Cup Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cup Type <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  name="cupSpecsId"
                  value={selectedCupSpecsId}
                  options={cupTypes.map(cupType => ({
                    value: cupType.label_id,
                    label: `${cupType.label}${cupType.design_name ? ` (${cupType.design_name})` : ''} - ${cupType.volume}ml, ${cupType.diameter}cm`
                  }))}
                  placeholder="Select a cup type"
                  required
                  disabled={loading || cupTypes.length === 0}
                  onChange={(e) => setSelectedCupSpecsId(e.target.value)}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
                {cupTypes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No cup types available. Please add cup types first.</p>
                )}
              </div>
            </div>

            {/* Order Quantity */}
            <LabeledInput
              label="Order Quantity"
              name="orderQuantity"
              type="number"
              min="1"
              step="1"
              defaultValue={order ? order.order_quantity || '' : ''}
              placeholder="Enter order quantity"
              required
              disabled={loading}
            />

            {/* 2x2 Grid for Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Date */}
              <div>
                <LabeledInput
                  label="Order Date"
                  name="orderDate"
                  type="date"
                  defaultValue={order ? formatDateForInput(order.order_date) : ''}
                  required
                  disabled={loading}
                />
              </div>

              {/* Estimated Dispatch Date */}
              <div>
                <LabeledInput
                  label="Estimated Dispatch Date"
                  name="dispatchDate"
                  type="date"
                  defaultValue={order ? formatDateForInput(order.dispatch_date) : ''}
                  disabled={loading}
                />
              </div>

              {/* Payment Due Date */}
              <div>
                <LabeledInput
                  label="Payment Due Date"
                  name="paymentDueDate"
                  type="date"
                  defaultValue={order ? formatDateForInput(order.payment_due_date) : ''}
                  disabled={loading}
                />
              </div>

              {/* Payment Receiving Date */}
              <div>
                <LabeledInput
                  label="Payment Receiving Date"
                  name="paymentDate"
                  type="date"
                  defaultValue={order ? formatDateForInput(order.payment_received_date) : ''}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Invoice Amount - Full Width */}
            <LabeledInput
              label="Invoice Amount"
              name="invoiceAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={order && order.invoice_amount ? order.invoice_amount : ''}
              disabled={loading}
            />

            {/* Remarks */}
            <LabeledInput
              label="Remarks"
              name="remarks"
              type="textarea"
              rows={3}
              defaultValue={order ? (order.remarks || '') : ''}
              placeholder="Any remarks..."
              disabled={loading}
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                disabled={loading || clients.length === 0 || cupTypes.length === 0}
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
