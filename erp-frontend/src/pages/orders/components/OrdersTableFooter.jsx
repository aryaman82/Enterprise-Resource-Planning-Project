import React from 'react';

const OrdersTableFooter = ({ totalCount }) => {
    return (
        <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">{totalCount}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="text-sm text-gray-500">
                    {/* Pagination controls will be added later */}
                </div>
            </div>
        </div>
    );
};

export default OrdersTableFooter;

