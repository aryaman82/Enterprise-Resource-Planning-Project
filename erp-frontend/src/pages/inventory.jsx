import React from 'react';
import { Package } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            {/* Inventory Icon */}
            <div className="flex-shrink-0">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Package className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            {/* Page Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-gray-600 mt-1">Manage stock levels and inventory items.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Page</h2>
          <p className="text-gray-600">This page is under construction. Inventory management features will be added soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
