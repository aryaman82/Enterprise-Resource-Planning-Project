// Valid status options
export const ORDER_STATUSES = [
    'Received',
    'Processing',
    'In Production',
    'Ready for Dispatch',
    'Dispatched'
];

// Helper function to get status color
export const getStatusColor = (status) => {
    const colorMap = {
        'Received': 'bg-blue-100 text-blue-800',
        'Processing': 'bg-yellow-100 text-yellow-800',
        'In Production': 'bg-orange-100 text-orange-800',
        'Ready for Dispatch': 'bg-purple-100 text-purple-800',
        'Dispatched': 'bg-green-100 text-green-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to compute order status based on dates (fallback if no status in DB)
export const computeOrderStatus = (order) => {
    // If status exists in database, use it
    if (order.status) {
        return { status: order.status, color: getStatusColor(order.status) };
    }

    // Otherwise compute from dates (backward compatibility)
    const now = new Date();
    const dispatchDate = order.dispatch_date ? new Date(order.dispatch_date) : null;
    const paymentDate = order.payment_received_date ? new Date(order.payment_received_date) : null;

    // If dispatched date is set and in the past, order is dispatched
    if (dispatchDate && dispatchDate < now) {
        return { status: 'Dispatched', color: 'bg-green-100 text-green-800' };
    }

    // If dispatch date is set but in the future, ready for dispatch
    if (dispatchDate && dispatchDate >= now) {
        return { status: 'Ready for Dispatch', color: 'bg-purple-100 text-purple-800' };
    }

    // If payment received, likely in production
    if (paymentDate) {
        return { status: 'In Production', color: 'bg-orange-100 text-orange-800' };
    }

    // If order date exists but no payment, processing
    if (order.order_date) {
        return { status: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
    }

    // Default to received
    return { status: 'Received', color: 'bg-blue-100 text-blue-800' };
};

// Helper function to format order reference
export const formatOrderReference = (orderId) => {
    return `#ORD-${String(orderId).padStart(5, '0')}`;
};

// Helper function to format date for display
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to format date for CSV export
export const formatDateForCSV = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// Export orders to CSV
export const exportOrdersToCSV = (orders) => {
    if (!orders || orders.length === 0) {
        return;
    }

    // CSV headers
    const headers = [
        'Order Reference',
        'Order ID',
        'Status',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Design Name',
        'Order Date',
        'Estimated Dispatch Date',
        'Payment Received Date',
        'Invoice Amount',
        'Specs',
        'Remarks',
        'Created By',
        'Last Updated'
    ];

    // Convert orders to CSV rows
    const rows = orders.map((order) => {
        const status = computeOrderStatus(order);
        return [
            formatOrderReference(order.order_id),
            order.order_id || '',
            status.status || '',
            order.client_name || '',
            order.client_email || '',
            order.client_phone || '',
            order.design_name || '',
            formatDateForCSV(order.order_date),
            formatDateForCSV(order.dispatch_date),
            formatDateForCSV(order.payment_received_date),
            order.invoice_amount || '',
            (order.specs || '').replace(/"/g, '""'), // Escape quotes in CSV
            (order.remarks || '').replace(/"/g, '""'), // Escape quotes in CSV
            order.created_by || '',
            formatDateForCSV(order.last_updated)
        ];
    });

    // Escape and wrap fields that contain commas, quotes, or newlines
    const escapeCSV = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    // Create CSV content
    const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

// Filter orders based on view mode, search term, status, and time
export const filterOrders = (orders, searchTerm, statusFilter, timeFilter, viewMode = 'ongoing') => {
    return orders.filter((order) => {
        // View mode filter - separate ongoing orders from dispatched orders
        const status = computeOrderStatus(order);
        if (viewMode === 'ongoing') {
            // Ongoing orders: exclude 'Dispatched' status
            if (status.status === 'Dispatched') {
                return false;
            }
        } else if (viewMode === 'history') {
            // History: only show 'Dispatched' status
            if (status.status !== 'Dispatched') {
                return false;
            }
        }
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            formatOrderReference(order.order_id).toLowerCase().includes(searchLower) ||
            (order.client_name && order.client_name.toLowerCase().includes(searchLower)) ||
            (order.remarks && order.remarks.toLowerCase().includes(searchLower)) ||
            (order.specs && order.specs.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

        // Status filter
        if (statusFilter !== 'All Statuses') {
            const status = computeOrderStatus(order);
            if (status.status !== statusFilter) return false;
        }

        // Dispatch date filter
        if (timeFilter !== 'All Time' && order.dispatch_date) {
            const dispatchDate = new Date(order.dispatch_date);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today);
            thisWeek.setDate(today.getDate() - today.getDay());
            const nextWeek = new Date(thisWeek);
            nextWeek.setDate(thisWeek.getDate() + 7);
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

            switch (timeFilter) {
                case 'Today': {
                    // Dispatch date is today
                    const dispatchDateOnly = new Date(dispatchDate.getFullYear(), dispatchDate.getMonth(), dispatchDate.getDate());
                    if (dispatchDateOnly.getTime() !== today.getTime()) return false;
                    break;
                }
                case 'This Week':
                    // Dispatch date is within this week (including today)
                    if (dispatchDate < thisWeek || dispatchDate >= nextWeek) return false;
                    break;
                case 'This Month':
                    // Dispatch date is within this month
                    if (dispatchDate < thisMonth || dispatchDate >= nextMonth) return false;
                    break;
                case 'Last 3 Months':
                    // Dispatch date is within the last 3 months
                    if (dispatchDate < threeMonthsAgo) return false;
                    break;
                default:
                    break;
            }
        } else if (timeFilter !== 'All Time' && !order.dispatch_date) {
            // If no dispatch date and filter is not "All Time", exclude the order
            return false;
        }

        return true;
    });
};

