import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AddOrderModal from './addordermodal';
import OrderDetailModal from './components/OrderDetailModal';
import { fetchOrders, addOrder, updateOrder, deleteOrder, updateOrderStatus } from '../../api/order.api';
import { formatOrderReference, filterOrders, exportOrdersToCSV } from './utils/orderUtils';
import OrdersPageHeader from './components/OrdersPageHeader';
import OrdersFiltersBar from './components/OrdersFiltersBar';
import OrdersLoadingState from './components/OrdersLoadingState';
import OrdersEmptyState from './components/OrdersEmptyState';
import OrdersTable from './components/OrdersTable';
import OrdersTableFooter from './components/OrdersTableFooter';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('ongoing'); // 'ongoing' or 'history'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Fetch orders from backend
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter orders based on view mode, search term, status, and time
    const filteredOrders = filterOrders(orders, searchTerm, statusFilter, timeFilter, viewMode);

    const handleExport = () => {
        const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders;
        if (ordersToExport.length === 0) {
            toast.error('No orders to export');
            return;
        }
        
        try {
            exportOrdersToCSV(ordersToExport);
            toast.success(`Exported ${ordersToExport.length} order(s) to CSV`);
        } catch (error) {
            console.error('Error exporting orders:', error);
            toast.error('Failed to export orders. Please try again.');
        }
    };

    const handleNewOrder = () => {
        setEditingOrder(null);
        setModalOpen(true);
    };

    const handleEdit = (orderId) => {
        const order = orders.find(o => o.order_id === orderId);
        if (order) {
            setEditingOrder(order);
            setModalOpen(true);
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm(`Are you sure you want to delete order ${formatOrderReference(orderId)}?`)) {
            return;
        }

        try {
            await deleteOrder(orderId);
            toast.success(`Order ${formatOrderReference(orderId)} deleted successfully`);
            loadOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            const errorMessage = error.message || 'Failed to delete order';
            toast.error(errorMessage);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingOrder(null);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const clientId = formData.get('clientId');
        const cupSpecsId = formData.get('cupSpecsId');
        
        const orderData = {
            client_id: clientId ? parseInt(clientId) : null,
            cup_specs_id: cupSpecsId || null,
            order_quantity: formData.get('orderQuantity') ? parseInt(formData.get('orderQuantity')) : null,
            order_date: formData.get('orderDate') || null,
            dispatch_date: formData.get('dispatchDate') || null,
            payment_received_date: formData.get('paymentDate') || null,
            payment_due_date: formData.get('paymentDueDate') || null,
            invoice_amount: formData.get('invoiceAmount') ? parseFloat(formData.get('invoiceAmount')) : null,
            remarks: formData.get('remarks') || null,
        };

        try {
            if (editingOrder) {
                await updateOrder(editingOrder.order_id, orderData);
                toast.success(`Order ${formatOrderReference(editingOrder.order_id)} updated successfully`);
            } else {
                await addOrder(orderData);
                toast.success('Order added successfully');
            }
            setModalOpen(false);
            setEditingOrder(null);
            loadOrders();
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error(error.message || 'Failed to save order');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast.success('Status updated successfully');
            // Reload orders to get the updated status
            await loadOrders();
            
            // If status changed to 'Dispatched', switch to history view
            if (newStatus === 'Dispatched') {
                setViewMode('history');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleViewDetail = (orderId) => {
        setSelectedOrderId(orderId);
        setDetailModalOpen(true);
    };

    const handleDetailModalClose = () => {
        setDetailModalOpen(false);
        setSelectedOrderId(null);
    };

    return (
        <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
            <AddOrderModal 
                open={modalOpen} 
                onClose={handleModalClose} 
                onSubmit={handleModalSubmit}
                order={editingOrder}
            />
            
            <OrderDetailModal
                orderId={selectedOrderId}
                open={detailModalOpen}
                onClose={handleDetailModalClose}
                onEdit={(orderId) => {
                    handleDetailModalClose();
                    handleEdit(orderId);
                }}
            />
            
            <OrdersPageHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrdersFiltersBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    timeFilter={timeFilter}
                    onTimeFilterChange={setTimeFilter}
                    onExportClick={handleExport}
                    onNewOrderClick={handleNewOrder}
                    viewMode={viewMode}
                />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* View Mode Toggle Row */}
                    <div className="border-b border-gray-200 bg-white">
                        <div className="flex">
                            <button
                                onClick={() => setViewMode('ongoing')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 border-r border-gray-200 ${
                                    viewMode === 'ongoing'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Ongoing Orders
                            </button>
                            <button
                                onClick={() => setViewMode('history')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                                    viewMode === 'history'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                History
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <OrdersLoadingState />
                        ) : filteredOrders.length === 0 ? (
                            <OrdersEmptyState
                                onNewOrderClick={handleNewOrder}
                                hasOrders={orders.length > 0}
                            />
                        ) : (
                            <>
                                <OrdersTable
                                    orders={filteredOrders}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewDetail={handleViewDetail}
                                />
                                <OrdersTableFooter totalCount={filteredOrders.length} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
