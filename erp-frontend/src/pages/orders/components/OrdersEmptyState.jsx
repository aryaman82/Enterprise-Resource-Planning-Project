import React from 'react';
import { ClipboardList } from 'lucide-react';

const OrdersEmptyState = ({ onNewOrderClick, hasOrders }) => {
    return (
        <div className="flex flex-col justify-center items-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No orders found</p>
            {!hasOrders && (
                <button
                    onClick={onNewOrderClick}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create Your First Order
                </button>
            )}
        </div>
    );
};

export default OrdersEmptyState;

