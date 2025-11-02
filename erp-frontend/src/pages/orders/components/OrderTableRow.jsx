import React from 'react';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatOrderReference, formatDate, computeOrderStatus } from '../utils/orderUtils';
import OrderStatusDropdown from './OrderStatusDropdown';

const OrderTableRow = ({ order, onStatusChange, onEdit, onDelete, onViewDetail }) => {
    const statusInfo = computeOrderStatus(order);
    const currentStatus = statusInfo.status;

    const handleRowClick = (e) => {
        // Don't trigger if clicking on action buttons or status dropdown
        if (e.target.closest('button') || e.target.closest('select')) {
            return;
        }
        if (onViewDetail) {
            onViewDetail(order.order_id);
        }
    };

    return (
        <tr 
            className={`transition-colors duration-150 cursor-pointer ${
                order.is_payment_overdue 
                    ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' 
                    : 'hover:bg-gray-50'
            }`}
            onClick={handleRowClick}
        >
            {/* Order Status - Editable Dropdown Button */}
            <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatusDropdown
                    currentStatus={currentStatus}
                    statusColor={statusInfo.color}
                    onStatusChange={(newStatus) => onStatusChange(order.order_id, newStatus)}
                />
            </td>

            {/* Reference and Client */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">
                        {formatOrderReference(order.order_id)}
                    </div>
                    {order.is_payment_overdue && (
                        <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full"
                            title="Payment Overdue"
                        >
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-500">
                    {order.client_name || 'No client assigned'}
                </div>
            </td>

            {/* Estimated Dispatch Date */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(order.dispatch_date)}
            </td>

            {/* Remarks */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate" title={order.remarks || ''}>
                    {order.remarks || 'N/A'}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                    {/* Edit Button */}
                    <button
                        onClick={() => onEdit(order.order_id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                        title="Edit Order"
                    >
                        <Edit className="h-4 w-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => onDelete(order.order_id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                        title="Delete Order"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default OrderTableRow;

