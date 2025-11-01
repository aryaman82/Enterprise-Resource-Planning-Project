import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Package, User, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fetchOrders } from '../../../api/order.api';
import { formatOrderReference } from '../../orders/utils/orderUtils';
import CustomDropdown from '../../orders/components/CustomDropdown';

const ProductionScheduleModal = ({ isOpen, onClose, onSave, schedule = null, machineId, existingSchedules = [] }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [formData, setFormData] = useState({
    orderId: '',
    orderNumber: '',
    quantity: '',
    startTime: '',
    endTime: '',
    operator: '',
    shift: 'Day',
    status: 'planned',
    remarks: ''
  });

  const loadOrders = React.useCallback(async () => {
    try {
      setLoadingOrders(true);
      const ordersData = await fetchOrders();
      // Filter out dispatched orders for new schedules, allow all for editing
      const filteredOrders = schedule 
        ? ordersData 
        : ordersData.filter(order => order.status !== 'Dispatched');
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [schedule]);

  // Load orders when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, loadOrders]);

  useEffect(() => {
    if (schedule) {
      // Find the order from schedule's orderNumber or orderId
      const order = orders.find(o => 
        o.order_id === schedule.orderId || 
        formatOrderReference(o.order_id) === schedule.orderNumber ||
        `ORD-${o.order_id}` === schedule.orderNumber
      );
      
      setFormData({
        orderId: schedule.orderId || order?.order_id || '',
        orderNumber: schedule.orderNumber || (order ? formatOrderReference(order.order_id) : ''),
        quantity: schedule.quantity || '',
        startTime: schedule.startTime ? format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm") : '',
        endTime: schedule.endTime ? format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        operator: schedule.operator || '',
        shift: schedule.shift || 'Day',
        status: schedule.status || 'planned',
        remarks: schedule.remarks || ''
      });
      setSelectedOrder(order);
    } else {
      // Set default start time to now
      const now = new Date();
      now.setMinutes(0);
      const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
      const defaultEnd = format(new Date(now.getTime() + 4 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"); // +4 hours
      
      setFormData({
        orderId: '',
        orderNumber: '',
        quantity: '',
        startTime: defaultStart,
        endTime: defaultEnd,
        operator: '',
        shift: 'Day',
        status: 'planned',
        remarks: ''
      });
      setSelectedOrder(null);
    }
    setQuantityError('');
  }, [schedule, isOpen, orders]);

  // Validate quantity against order quantity and existing schedules
  const validateQuantity = (orderId, quantity, excludeScheduleId = null) => {
    if (!orderId || !quantity) {
      setQuantityError('');
      return true;
    }

    const order = orders.find(o => o.order_id === orderId);
    if (!order || !order.order_quantity) {
      setQuantityError('');
      return true;
    }

    // Sum up all existing production quantities for this order (excluding current schedule being edited)
    const totalProductionQuantity = existingSchedules
      .filter(s => 
        (s.orderId === orderId || 
         (s.orderNumber && formatOrderReference(orderId) === s.orderNumber)) &&
        s.id !== excludeScheduleId
      )
      .reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);

    const newQuantity = parseInt(quantity) || 0;
    const totalAfterThis = totalProductionQuantity + newQuantity;

    if (totalAfterThis > order.order_quantity) {
      const remaining = order.order_quantity - totalProductionQuantity;
      setQuantityError(
        `Total production quantity (${totalProductionQuantity + newQuantity}) exceeds order quantity (${order.order_quantity}). Remaining available: ${remaining > 0 ? remaining : 0}`
      );
      return false;
    }

    setQuantityError('');
    return true;
  };

  const handleOrderChange = (orderId) => {
    const order = orders.find(o => o.order_id === parseInt(orderId));
    if (order) {
      setSelectedOrder(order);
      setFormData(prev => ({
        ...prev,
        orderId: order.order_id,
        orderNumber: formatOrderReference(order.order_id),
        quantity: order.order_quantity || ''
      }));
      // Validate quantity after setting
      setTimeout(() => {
        validateQuantity(order.order_id, order.order_quantity || '', schedule?.id);
      }, 100);
    } else {
      setSelectedOrder(null);
      setFormData(prev => ({
        ...prev,
        orderId: '',
        orderNumber: '',
        quantity: ''
      }));
      setQuantityError('');
    }
  };

  const handleQuantityChange = (quantity) => {
    setFormData(prev => ({ ...prev, quantity }));
    if (formData.orderId) {
      validateQuantity(formData.orderId, quantity, schedule?.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate quantity before submitting
    if (!validateQuantity(formData.orderId, formData.quantity, schedule?.id)) {
      return;
    }

    if (!formData.orderId) {
      setQuantityError('Please select an order');
      return;
    }

    const scheduleData = {
      ...formData,
      machineId: machineId,
      machine_id: machineId,
      id: schedule?.id || Date.now(),
      orderId: formData.orderId,
      orderNumber: formData.orderNumber || formatOrderReference(formData.orderId),
      quantity: parseInt(formData.quantity),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    };
    onSave(scheduleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {schedule ? 'Edit Production Schedule' : 'Add Production Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Selection */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Order *</span>
            </label>
            {loadingOrders ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading orders...
              </div>
            ) : (
              <CustomDropdown
                required
                value={formData.orderId || ''}
                onChange={(e) => handleOrderChange(e.target.value)}
                options={[
                  { value: '', label: 'Select an order...' },
                  ...orders.map(order => ({
                    value: order.order_id,
                    label: `${formatOrderReference(order.order_id)} - ${order.client_name || 'Unknown Client'}${order.order_quantity ? ` (Qty: ${order.order_quantity})` : ''}${order.status ? ` - ${order.status}` : ''}`
                  }))
                ]}
                placeholder="Select an order..."
                className="w-full"
              />
            )}
            {selectedOrder && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Order Quantity: {selectedOrder.order_quantity || 'N/A'}</p>
                {selectedOrder.client_name && <p>Client: {selectedOrder.client_name}</p>}
              </div>
            )}
          </div>

          {/* Quantity and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4" />
                <span>Production Quantity *</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  quantityError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1000"
              />
              {quantityError && (
                <div className="mt-1 flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{quantityError}</span>
                </div>
              )}
              {selectedOrder && !quantityError && formData.quantity && (
                <div className="mt-1 text-xs text-gray-500">
                  {(() => {
                    const totalProductionQuantity = existingSchedules
                      .filter(s => 
                        (s.orderId === selectedOrder.order_id || 
                         (s.orderNumber && formatOrderReference(selectedOrder.order_id) === s.orderNumber)) &&
                        s.id !== schedule?.id
                      )
                      .reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
                    const remaining = selectedOrder.order_quantity - (totalProductionQuantity + parseInt(formData.quantity || 0));
                    return `Remaining: ${remaining} of ${selectedOrder.order_quantity}`;
                  })()}
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <span>Status *</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Start Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4" />
                <span>End Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Operator and Shift */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span>Operator</span>
              </label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Operator name"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4" />
                <span>Shift</span>
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              <span>Remarks</span>
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or remarks..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {schedule ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionScheduleModal;

