import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AddOrderModal from './addordermodal';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

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

    // Filter orders based on search term, status, and time
    const filteredOrders = filterOrders(orders, searchTerm, statusFilter, timeFilter);

    const handleExport = () => {
        if (orders.length === 0) {
            toast.error('No orders to export');
            return;
        }
        
        try {
            exportOrdersToCSV(orders);
            toast.success(`Exported ${orders.length} order(s) to CSV`);
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
        const designId = formData.get('designId');
        
        const orderData = {
            client_id: clientId ? parseInt(clientId) : null,
            design_id: designId ? parseInt(designId) : null,
            order_date: formData.get('orderDate') || null,
            dispatch_date: formData.get('dispatchDate') || null,
            payment_received_date: formData.get('paymentDate') || null,
            invoice_amount: formData.get('invoiceAmount') ? parseFloat(formData.get('invoiceAmount')) : null,
            specs: formData.get('specs') || null,
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
            // Update the local state
            setOrders(orders.map(order => 
                order.order_id === orderId 
                    ? { ...order, status: newStatus }
                    : order
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    return (
        <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
            <AddOrderModal 
                open={modalOpen} 
                onClose={handleModalClose} 
                onSubmit={handleModalSubmit}
                order={editingOrder}
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
                />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
