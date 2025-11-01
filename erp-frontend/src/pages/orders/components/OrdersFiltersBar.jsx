import React from 'react';
import { Search, Download, Plus, ChevronDown } from 'lucide-react';

const OrdersFiltersBar = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    timeFilter,
    onTimeFilterChange,
    onExportClick,
    onNewOrderClick
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search Input */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by reference, client, notes..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Filter Dropdowns and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    {/* Status Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="appearance-none px-4 py-2 pr-12 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>All Statuses</option>
                            <option>Received</option>
                            <option>Processing</option>
                            <option>In Production</option>
                            <option>Ready for Dispatch</option>
                            <option>Dispatched</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Dispatch Date Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={timeFilter}
                            onChange={(e) => onTimeFilterChange(e.target.value)}
                            className="appearance-none px-4 py-2 pr-12 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>All Time</option>
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={onExportClick}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>

                    {/* New Order Button */}
                    <button
                        onClick={onNewOrderClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersFiltersBar;

