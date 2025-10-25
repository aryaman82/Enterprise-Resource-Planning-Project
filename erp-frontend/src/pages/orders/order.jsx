import React, { useState } from 'react';
import {
    ClipboardList,
    Search,
    Download,
    Plus,
    Edit,
    Trash2,
} from 'lucide-react';
import AddOrderModal from './addordermodal';

// Dummy data for orders table
const dummyOrders = [
    {
        id: 1,
        status: 'Received',
        reference: '#ORD-00123',
        client: 'Client Name A',
        estimatedDispatch: '2023-11-10',
        remarks: 'Awaiting payment confirmation.',
        statusColor: 'bg-blue-100 text-blue-800'
    },
    {
        id: 2,
        status: 'Processing',
        reference: '#ORD-00124',
        client: 'Client Name B',
        estimatedDispatch: '2023-11-08',
        remarks: 'Materials being gathered.',
        statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
        id: 3,
        status: 'In Production',
        reference: '#ORD-00125',
        client: 'Client Name C',
        estimatedDispatch: '2023-11-12',
        remarks: 'On assembly line 2.',
        statusColor: 'bg-orange-100 text-orange-800'
    },
    {
        id: 4,
        status: 'Ready for Dispatch',
        reference: '#ORD-00126',
        client: 'Client Name D',
        estimatedDispatch: '2023-11-05',
        remarks: 'Packaging complete. Awaiting courier.',
        statusColor: 'bg-purple-100 text-purple-800'
    },
    {
        id: 5,
        status: 'Dispatched',
        reference: '#ORD-00127',
        client: 'Client Name E',
        estimatedDispatch: '2023-11-01',
        remarks: 'Tracking number: XYZ123456789',
        statusColor: 'bg-green-100 text-green-800'
    },
];

const Orders = () => {
    // State for search functionality (will be implemented later)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [timeFilter, setTimeFilter] = useState('All Time');

    // Modal state for AddOrderModal
    const [modalOpen, setModalOpen] = useState(false);

    // Placeholder functions for buttons (to be implemented later)
    const handleSearch = () => {
        console.log('Search functionality to be implemented');
    };

    const handleExport = () => {
        console.log('Export functionality to be implemented');
    };

    const handleNewOrder = () => {
        setModalOpen(true);
    };

    const handleEdit = (orderId) => {
        console.log(`Edit order ${orderId} functionality to be implemented`);
    };

    const handleDelete = (orderId) => {
        console.log(`Delete order ${orderId} functionality to be implemented`);
    };

    // Handle modal close
    const handleModalClose = () => setModalOpen(false);

    // Handle modal submit (for now just close)
    const handleModalSubmit = (e) => {
        // You can process form data here
        setModalOpen(false);
    };

    return (
        <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Add Order Modal */}
            <AddOrderModal open={modalOpen} onClose={handleModalClose} onSubmit={handleModalSubmit} />
            {/* Page Header */}
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Bar */}
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
                                    placeholder="Search by reference, notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filter Dropdowns and Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            {/* Status Filter Dropdown */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option>All Statuses</option>
                                <option>Received</option>
                                <option>Processing</option>
                                <option>In Production</option>
                                <option>Ready for Dispatch</option>
                                <option>Dispatched</option>
                            </select>

                            {/* Time Filter Dropdown */}
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option>All Time</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                            </select>

                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>

                            {/* New Order Button */}
                            <button
                                onClick={handleNewOrder}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Order
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Container with horizontal scroll for mobile */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Table Header */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estimated Dispatch Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remarks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dummyOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        {/* Order Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.statusColor}`}>
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Reference and Client */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.reference}</div>
                                            <div className="text-sm text-gray-500">{order.client}</div>
                                        </td>

                                        {/* Estimated Dispatch Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.estimatedDispatch}
                                        </td>

                                        {/* Remarks */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={order.remarks}>
                                                {order.remarks}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEdit(order.id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                                                    title="Edit Order"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer - Pagination placeholder */}
                    <div className="bg-white px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
                                <span className="font-medium">5</span> results
                            </div>
                            <div className="text-sm text-gray-500">
                                {/* Pagination controls will be added later */}
                                Pagination controls to be implemented
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
