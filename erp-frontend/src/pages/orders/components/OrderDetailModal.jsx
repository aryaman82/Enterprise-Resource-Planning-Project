import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Calendar, Package, MapPin, User, FileText, Loader2, Edit } from 'lucide-react';
import { getOrder } from '../../../api/order.api';
import { formatDate } from '../utils/orderUtils';
import { colors } from '../../../constants/colors';

// Reusable Section Header Component
const SectionHeader = ({ icon: IconComponent, title, iconColor = colors.text.secondary, badge, badgeColor, iconContent }) => {
    const iconElement = iconContent || (IconComponent ? <IconComponent className={`h-5 w-5 ${iconColor} mr-2`} /> : null);
    
    return (
        <div className="flex items-center mb-4">
            {iconElement}
            <h3 className={`text-lg font-semibold ${colors.text.primary}`}>{title}</h3>
            {badge && (
                <span className={`ml-auto px-3 py-1 ${badgeColor} text-xs font-semibold rounded-full flex items-center`}>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {badge}
                </span>
            )}
        </div>
    );
};

// Reusable Detail Field Component
const DetailField = ({ label, value, valueClassName = `text-base ${colors.text.primary}`, spanFullWidth = false }) => (
    <div className={spanFullWidth ? 'md:col-span-2' : ''}>
        <span className={`text-sm ${colors.text.tertiary}`}>{label}</span>
        <p className={valueClassName}>
            {value || (value === 0 ? '0' : 'N/A')}
        </p>
    </div>
);

// Reusable Section Wrapper Component
const Section = ({ icon, title, iconColor, badge, badgeColor, bgColor, borderColor, iconContent, children }) => (
    <section className={`rounded-lg p-5 ${bgColor} ${borderColor || ''}`}>
        <SectionHeader icon={icon} title={title} iconColor={iconColor} badge={badge} badgeColor={badgeColor} iconContent={iconContent} />
        {children}
    </section>
);

// Status Badge Helper
const StatusBadge = ({ status }) => {
    const statusColorMap = {
        'Dispatched': colors.status.dispatched,
        'Ready for Dispatch': colors.status.readyForDispatch,
        'In Production': colors.status.inProduction,
        'Processing': colors.status.processing,
        'Received': colors.status.received,
    };
    
    if (!status) return null;
    
    const statusColor = statusColorMap[status] || colors.status.default;
    
    return (
        <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
            {status}
        </span>
    );
};

// Format Currency Helper
const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format Number Helper
const formatNumber = (num) => {
    if (num == null) return 'N/A';
    return num.toLocaleString();
};

const OrderDetailModal = ({ orderId, open, onClose, onEdit }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadOrderDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOrder(orderId);
            setOrder(data);
        } catch (err) {
            console.error('Error loading order details:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (open && orderId) {
            loadOrderDetails();
        } else {
            setOrder(null);
            setError(null);
        }
    }, [open, orderId, loadOrderDetails]);

    if (!open) return null;

    const paymentSectionBg = order?.is_payment_overdue ? 'bg-red-50 border-2 border-red-300' : 'bg-green-50';
    const paymentIconColor = order?.is_payment_overdue ? colors.text.red.base : colors.text.green.base;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`${colors.background.primary} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${colors.border.base}`}>
                    <div>
                        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Order Details #{orderId}</h2>
                        <StatusBadge status={order?.status} />
                    </div>
                    <button
                        onClick={onClose}
                        className={`${colors.button.ghost.text} ${colors.button.ghost.hover} transition-colors`}
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className={`h-8 w-8 animate-spin ${colors.text.blue.base}`} />
                            <span className={`ml-3 ${colors.text.secondary}`}>Loading order details...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className={`h-12 w-12 ${colors.text.red.required} mx-auto mb-4`} />
                            <p className={colors.text.red.base}>{error}</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Client Information */}
                            <Section icon={User} title="Client Information" bgColor={colors.background.secondary}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailField label="Client Name" value={order.client_name} valueClassName={`text-base font-medium ${colors.text.primary}`} />
                                    <DetailField label="Email" value={order.client_email} />
                                    <DetailField label="Phone" value={order.client_phone} />
                                </div>
                            </Section>

                            {/* Cup Specifications */}
                            {order.cup_info && order.cup_info.length > 0 && (
                                <Section icon={Package} title="Cup Specifications" iconColor={colors.text.purple.light} bgColor="bg-purple-50">
                                    <div className="space-y-4">
                                        {order.cup_info.map((cup, index) => (
                                            <div key={index} className={`${colors.background.primary} rounded-lg p-4 border border-purple-200`}>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <DetailField label="Cup Type" value={cup.cup_type} valueClassName={`text-base font-medium ${colors.text.primary}`} />
                                                    <DetailField label="Volume" value={cup.volume ? `${cup.volume} oz` : null} />
                                                    <DetailField label="Diameter" value={cup.diameter ? `${cup.diameter}"` : null} />
                                                    <DetailField 
                                                        label="Quantity Produced" 
                                                        value={cup.total_quantity_produced ? formatNumber(cup.total_quantity_produced) : '0'} 
                                                        valueClassName={`text-base font-medium ${colors.text.primary}`} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Payment Information */}
                            <Section 
                                title="Payment Information"
                                iconContent={<span className={`text-xl mr-2 font-semibold ${paymentIconColor}`}>₹</span>}
                                badge={order.is_payment_overdue ? 'Payment Overdue' : null}
                                badgeColor={order.is_payment_overdue ? `bg-red-200 ${colors.text.red.light}` : ''}
                                bgColor={paymentSectionBg}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <DetailField 
                                        label="Invoice Amount" 
                                        value={formatCurrency(order.invoice_amount)} 
                                        valueClassName={`text-base font-medium ${colors.text.primary}`} 
                                    />
                                    <DetailField 
                                        label="Payment Due Date" 
                                        value={order.payment_due_date ? formatDate(order.payment_due_date) : null}
                                        valueClassName={`text-base ${order.is_payment_overdue ? `${colors.text.red.base} font-semibold` : colors.text.primary}`}
                                    />
                                    <DetailField 
                                        label="Payment Received Date" 
                                        value={order.payment_received_date ? formatDate(order.payment_received_date) : 'Not Received'} 
                                    />
                                </div>
                            </Section>

                            {/* Dispatch Information */}
                            <Section icon={Calendar} title="Dispatch Information" iconColor={colors.text.orange.light} bgColor="bg-orange-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailField label="Estimated Dispatch Date" value={order.dispatch_date ? formatDate(order.dispatch_date) : null} />
                                    <DetailField label="Actual Dispatch Date" value={order.dispatch_actual_date ? formatDate(order.dispatch_actual_date) : 'Not Dispatched'} />
                                    {order.dispatch_location && (
                                        <div className="md:col-span-2">
                                            <div className="flex items-start">
                                                <MapPin className={`h-5 w-5 ${colors.text.orange.light} mr-2 mt-0.5`} />
                                                <DetailField label="Dispatch Location" value={order.dispatch_location} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Section>

                            {/* Order Details */}
                            <Section icon={FileText} title="Order Details" iconColor={colors.text.blue.base} bgColor="bg-blue-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailField label="Design" value={order.design_name} valueClassName={`text-base font-medium ${colors.text.primary}`} />
                                    <DetailField label="Order Date" value={formatDate(order.order_date)} />
                                    <DetailField 
                                        label="Order Quantity" 
                                        value={order.order_quantity ? formatNumber(order.order_quantity) : null} 
                                        valueClassName={`text-base font-medium ${colors.text.primary}`} 
                                    />
                                    {order.cup_spec_label && (
                                        <>
                                            <DetailField label="Cup Type" value={order.cup_spec_label} valueClassName={`text-base font-medium ${colors.text.primary}`} />
                                            <DetailField label="Cup Volume" value={order.cup_volume ? `${order.cup_volume} oz` : null} />
                                            <DetailField label="Cup Diameter" value={order.cup_diameter ? `${order.cup_diameter}"` : null} />
                                        </>
                                    )}
                                    {order.specs && <DetailField label="Specifications" value={order.specs} spanFullWidth />}
                                    {order.remarks && <DetailField label="Remarks" value={order.remarks} spanFullWidth />}
                                </div>
                            </Section>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className={`border-t ${colors.border.base} p-4 flex justify-end gap-3`}>
                    {onEdit && (
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(orderId);
                            }}
                            className={`inline-flex items-center px-4 py-2 ${colors.button.primary.bg} ${colors.button.primary.text} rounded-md ${colors.button.primary.hover} transition-colors`}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Order
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${colors.button.secondary.bg} ${colors.button.secondary.text} rounded-md ${colors.button.secondary.hover} transition-colors`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
