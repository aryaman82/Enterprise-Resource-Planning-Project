import React from 'react';
import { Loader2 } from 'lucide-react';

const OrdersLoadingState = () => {
    return (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading orders...</span>
        </div>
    );
};

export default OrdersLoadingState;

