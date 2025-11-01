import React from 'react';
import { Search, Download, Plus, ChevronDown } from 'lucide-react';
import {
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from '@material-tailwind/react';

const STATUS_OPTIONS = [
    'All Statuses',
    'Received',
    'Processing',
    'In Production',
    'Ready for Dispatch'
];

const TIME_OPTIONS = [
    'All Time',
    'Today',
    'This Week',
    'This Month',
    'Last 3 Months'
];

const OrdersFiltersBar = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    timeFilter,
    onTimeFilterChange,
    onExportClick,
    onNewOrderClick,
    viewMode
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search Input */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by reference, client, notes..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 h-12 text-base border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Filter Dropdowns and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    {/* Status Filter Dropdown */}
                    <Menu placement="bottom-start">
                        <MenuHandler>
                            <Button
                                variant="outlined"
                                disabled={viewMode === 'history'}
                                className={`flex items-center gap-2 px-5 h-12 text-base border border-gray-300 rounded-md normal-case font-normal ${
                                    viewMode === 'history'
                                        ? 'bg-white text-gray-500 cursor-not-allowed opacity-75'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            >
                                {statusFilter}
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                        </MenuHandler>
                        {viewMode !== 'history' && (
                            <MenuList className="min-w-[100px] bg-white shadow-lg">
                                {STATUS_OPTIONS.map((status) => {
                                    const isSelected = status === statusFilter;
                                    return (
                                        <MenuItem
                                            key={status}
                                            onClick={() => {
                                                if (status !== statusFilter) {
                                                    onStatusFilterChange(status);
                                                }
                                            }}
                                            className={`
                                                flex items-center gap-2 p-2
                                                ${isSelected ? 'bg-blue-50 font-semibold' : 'bg-white text-gray-700'}
                                                hover:bg-gray-100 
                                                focus:bg-gray-100
                                                active:bg-gray-100
                                            `}
                                        >
                                            <span>{status}</span>
                                            {isSelected && (
                                                <span className="ml-auto text-blue-600 text-xs">✓</span>
                                            )}
                                        </MenuItem>
                                    );
                                })}
                            </MenuList>
                        )}
                    </Menu>

                    {/* Dispatch Date Filter Dropdown */}
                    <Menu placement="bottom-start">
                        <MenuHandler>
                            <Button
                                variant="outlined"
                                className="flex items-center gap-2 px-5 h-12 text-base border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 normal-case font-normal"
                            >
                                {timeFilter}
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                        </MenuHandler>
                        <MenuList className="min-w-[100px] bg-white shadow-lg">
                            {TIME_OPTIONS.map((time) => {
                                const isSelected = time === timeFilter;
                                return (
                                    <MenuItem
                                        key={time}
                                        onClick={() => {
                                            if (time !== timeFilter) {
                                                onTimeFilterChange(time);
                                            }
                                        }}
                                        className={`
                                            flex items-center gap-2 p-2
                                            ${isSelected ? 'bg-blue-50 font-semibold' : 'bg-white text-gray-700'}
                                            hover:bg-gray-100 
                                            focus:bg-gray-100
                                            active:bg-gray-100
                                        `}
                                    >
                                        <span>{time}</span>
                                        {isSelected && (
                                            <span className="ml-auto text-blue-600 text-xs">✓</span>
                                        )}
                                    </MenuItem>
                                );
                            })}
                        </MenuList>
                    </Menu>

                    {/* Export Button */}
                    <button
                        onClick={onExportClick}
                        className="inline-flex items-center px-5 h-12 text-base border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Export
                    </button>

                    {/* New Order Button */}
                    <button
                        onClick={onNewOrderClick}
                        className="inline-flex items-center px-5 h-12 text-base border border-transparent rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersFiltersBar;

