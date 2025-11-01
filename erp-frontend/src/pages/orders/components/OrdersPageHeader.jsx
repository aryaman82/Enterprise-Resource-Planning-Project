import React from 'react';
import { ClipboardList } from 'lucide-react';

const OrdersPageHeader = () => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center space-x-4">
                    {/* Orders Icon */}
                    <div className="flex-shrink-0">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <ClipboardList className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>

                    {/* Page Title and Description */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                        <p className="text-gray-600 mt-1">A complete log of all customer orders and shipments.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPageHeader;

