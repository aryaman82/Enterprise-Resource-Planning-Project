import pool from "../db.js";

// Get all orders with client information
export const getOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.dispatch_committed_date,
                o.dispatch_actual_date,
                o.payment_received_date,
                o.payment_due_date,
                o.invoice_amount,
                o.order_quantity,
                o.cup_specs_id,
                o.design_volume_weight,
                o.dispatch_location,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name,
                cs.label as cup_spec_label,
                cs.volume as cup_volume,
                cs.diameter as cup_diameter,
                cs.type as cup_type,
                cs.weight as cup_weight,
                -- Payment overdue flag
                CASE 
                    WHEN o.payment_due_date IS NOT NULL 
                    AND o.payment_received_date IS NULL 
                    AND o.payment_due_date::date < CURRENT_DATE
                    THEN true 
                    ELSE false 
                END as is_payment_overdue
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            LEFT JOIN cupspecs cs ON o.cup_specs_id = cs.label_id
            ORDER BY o.order_date DESC, o.order_id DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single order by ID with aggregated cup information
export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get order basic info
        const orderResult = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.dispatch_committed_date,
                o.dispatch_actual_date,
                o.payment_received_date,
                o.payment_due_date,
                o.invoice_amount,
                o.order_quantity,
                o.cup_specs_id,
                o.design_volume_weight,
                o.dispatch_location,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name,
                cs.label as cup_spec_label,
                cs.volume as cup_volume,
                cs.diameter as cup_diameter,
                cs.type as cup_type,
                cs.weight as cup_weight,
                -- Payment overdue flag
                CASE 
                    WHEN o.payment_due_date IS NOT NULL 
                    AND o.payment_received_date IS NULL 
                    AND o.payment_due_date::date < CURRENT_DATE
                    THEN true 
                    ELSE false 
                END as is_payment_overdue
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            LEFT JOIN cupspecs cs ON o.cup_specs_id = cs.label_id
            WHERE o.order_id = $1`,
            [id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Get aggregated cup information from transactions
        // Combine both cup transactions and printed cup transactions
        const cupInfoResult = await pool.query(
            `SELECT 
                label_id,
                cup_type,
                diameter,
                volume,
                SUM(total_quantity_produced) as total_quantity_produced,
                SUM(transaction_count) as transaction_count
            FROM (
                SELECT 
                    cs.label_id,
                    cs.label as cup_type,
                    cs.diameter,
                    cs.volume,
                    COALESCE(SUM(ct.quantity), 0) as total_quantity_produced,
                    COUNT(DISTINCT ct.cup_txn_id) as transaction_count
                FROM cuptransactions ct
                INNER JOIN cups cup ON ct.cup_id = cup.cup_id
                INNER JOIN cupspecs cs ON cup.cup_id = cs.label_id
                WHERE ct.order_id = $1
                GROUP BY cs.label_id, cs.label, cs.diameter, cs.volume
                UNION ALL
                SELECT 
                    pcs.label_id,
                    pcs.label as cup_type,
                    pcs.diameter,
                    pcs.volume,
                    COALESCE(SUM(pct.quantity), 0) as total_quantity_produced,
                    COUNT(DISTINCT pct.printed_cup_txn_id) as transaction_count
                FROM printedcuptransactions pct
                INNER JOIN cupspecs pcs ON pct.printed_cup_id = pcs.label_id
                WHERE pct.order_id = $1
                GROUP BY pcs.label_id, pcs.label, pcs.diameter, pcs.volume
            ) combined
            GROUP BY label_id, cup_type, diameter, volume`,
            [id]
        );

        const order = orderResult.rows[0];
        order.cup_info = cupInfoResult.rows; // Array of cup types used in this order

        res.json({ success: true, data: order });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new order
export const addOrder = async (req, res) => {
    try {
        const { 
            design_id, 
            client_id, 
            order_date,
            dispatch_date,
            dispatch_committed_date,
            dispatch_actual_date,
            payment_received_date,
            payment_due_date,
            invoice_amount,
            order_quantity,
            cup_specs_id,
            design_volume_weight,
            dispatch_location,
            specs, 
            remarks,
            created_by 
        } = req.body;

        // Validate required fields
        if (!client_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Client ID is required',
                error: 'MISSING_CLIENT_ID'
            });
        }

        // Validate cup_specs_id if provided and get design_id from it
        let finalDesignId = design_id;
        if (cup_specs_id) {
            const cupSpecsCheck = await pool.query(
                'SELECT label_id, design_id FROM cupspecs WHERE label_id = $1', 
                [cup_specs_id]
            );
            if (cupSpecsCheck.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Cup specification not found',
                    error: 'CUP_SPEC_NOT_FOUND'
                });
            }
            // Use design_id from cup specs if available and design_id not explicitly provided
            if (!finalDesignId && cupSpecsCheck.rows[0].design_id) {
                finalDesignId = cupSpecsCheck.rows[0].design_id;
            }
        }

        // Validate that client exists
        const clientCheck = await pool.query(
            'SELECT client_id FROM clients WHERE client_id = $1', 
            [client_id]
        );

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client not found',
                error: 'CLIENT_NOT_FOUND'
            });
        }

        // Validate design if design_id is provided or derived
        if (finalDesignId) {
            const designCheck = await pool.query(
                'SELECT design_id FROM designs WHERE design_id = $1', 
                [finalDesignId]
            );
            if (designCheck.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Design not found',
                    error: 'DESIGN_NOT_FOUND'
                });
            }
        }

        // Convert empty strings to null for optional fields
        const orderDate = order_date || new Date().toISOString();
        const dispatchDate = dispatch_date || null;
        const dispatchCommittedDate = dispatch_committed_date || null;
        const dispatchActualDate = dispatch_actual_date || null;
        const paymentDate = payment_received_date || null;
        const paymentDueDate = payment_due_date || null;
        const invoiceAmt = invoice_amount || null;
        const orderQty = order_quantity || null;
        const cupSpecsId = cup_specs_id || null;
        const designVolWeight = design_volume_weight || null;
        const dispatchLocation = dispatch_location || null;
        const orderSpecs = specs || null;
        const orderRemarks = remarks || null;
        const orderCreatedBy = created_by || null;

        const result = await pool.query(
            `INSERT INTO orders (
                design_id, 
                client_id, 
                order_date,
                dispatch_date,
                dispatch_committed_date,
                dispatch_actual_date,
                payment_received_date,
                payment_due_date,
                invoice_amount,
                order_quantity,
                cup_specs_id,
                design_volume_weight,
                dispatch_location,
                specs, 
                remarks,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *`,
            [
                finalDesignId || null,
                client_id,
                orderDate,
                dispatchDate,
                dispatchCommittedDate,
                dispatchActualDate,
                paymentDate,
                paymentDueDate,
                invoiceAmt,
                orderQty,
                cupSpecsId,
                designVolWeight,
                dispatchLocation,
                orderSpecs,
                orderRemarks,
                orderCreatedBy
            ]
        );

        // Fetch the complete order with client info (using same query as getOrder)
        const orderId = result.rows[0].order_id;
        return getOrder({ params: { id: orderId } }, res);
    } catch (err) {
        console.error('Error adding order:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add order',
            error: err.message 
        });
    }
};

// Update order
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            design_id, 
            client_id, 
            order_date,
            dispatch_date,
            dispatch_committed_date,
            dispatch_actual_date,
            payment_received_date,
            payment_due_date,
            invoice_amount,
            order_quantity,
            cup_specs_id,
            design_volume_weight,
            dispatch_location,
            specs, 
            remarks 
        } = req.body;

        // Check if order exists
        const checkResult = await pool.query(
            'SELECT order_id FROM orders WHERE order_id = $1', 
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Validate required fields
        if (!client_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Client ID is required',
                error: 'MISSING_CLIENT_ID'
            });
        }

        // Validate cup_specs_id if provided and get design_id from it
        let finalDesignId = design_id;
        if (cup_specs_id) {
            const cupSpecsCheck = await pool.query(
                'SELECT label_id, design_id FROM cupspecs WHERE label_id = $1', 
                [cup_specs_id]
            );
            if (cupSpecsCheck.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Cup specification not found',
                    error: 'CUP_SPEC_NOT_FOUND'
                });
            }
            // Use design_id from cup specs if available and design_id not explicitly provided
            if (!finalDesignId && cupSpecsCheck.rows[0].design_id) {
                finalDesignId = cupSpecsCheck.rows[0].design_id;
            }
        }

        // Validate that client exists
        const clientCheck = await pool.query(
            'SELECT client_id FROM clients WHERE client_id = $1', 
            [client_id]
        );

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client not found',
                error: 'CLIENT_NOT_FOUND'
            });
        }

        // Validate design if design_id is provided or derived
        if (finalDesignId) {
            const designCheck = await pool.query(
                'SELECT design_id FROM designs WHERE design_id = $1', 
                [finalDesignId]
            );
            if (designCheck.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Design not found',
                    error: 'DESIGN_NOT_FOUND'
                });
            }
        }

        // Update order
        const updateResult = await pool.query(
            `UPDATE orders 
            SET 
                design_id = $1,
                client_id = $2,
                order_date = $3,
                dispatch_date = $4,
                dispatch_committed_date = $5,
                dispatch_actual_date = $6,
                payment_received_date = $7,
                payment_due_date = $8,
                invoice_amount = $9,
                order_quantity = $10,
                cup_specs_id = $11,
                design_volume_weight = $12,
                dispatch_location = $13,
                specs = $14,
                remarks = $15,
                last_updated = CURRENT_TIMESTAMP
            WHERE order_id = $16
            RETURNING *`,
            [
                finalDesignId || null,
                client_id,
                order_date || null,
                dispatch_date || null,
                dispatch_committed_date || null,
                dispatch_actual_date || null,
                payment_received_date || null,
                payment_due_date || null,
                invoice_amount || null,
                order_quantity || null,
                cup_specs_id || null,
                design_volume_weight || null,
                dispatch_location || null,
                specs || null,
                remarks || null,
                id
            ]
        );

        // Fetch the complete order with client info (using same query as getOrder)
        return getOrder({ params: { id } }, res);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: err.message 
        });
    }
};

// Delete order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if order exists
        const checkResult = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1', 
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        const orderToDelete = checkResult.rows[0];

        // Check for dependent records
        const [cupTxnRes, printedCupTxnRes, rawMatTxnRes, sheetTxnRes] = await Promise.all([
            pool.query('SELECT COUNT(*)::int AS count FROM cuptransactions WHERE order_id = $1', [id]),
            pool.query('SELECT COUNT(*)::int AS count FROM printedcuptransactions WHERE order_id = $1', [id]),
            pool.query('SELECT COUNT(*)::int AS count FROM rawmaterialtransactions WHERE order_id = $1', [id]),
            pool.query('SELECT COUNT(*)::int AS count FROM sheettransactions WHERE order_id = $1', [id])
        ]);

        const cupTxnCount = cupTxnRes.rows[0]?.count || 0;
        const printedCupTxnCount = printedCupTxnRes.rows[0]?.count || 0;
        const rawMatTxnCount = rawMatTxnRes.rows[0]?.count || 0;
        const sheetTxnCount = sheetTxnRes.rows[0]?.count || 0;

        const totalDependencies = cupTxnCount + printedCupTxnCount + rawMatTxnCount + sheetTxnCount;

        if (totalDependencies > 0) {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: `Cannot delete order #${id} because it has related transactions.`,
                details: { 
                    cupTransactions: cupTxnCount,
                    printedCupTransactions: printedCupTxnCount,
                    rawMaterialTransactions: rawMatTxnCount,
                    sheetTransactions: sheetTxnCount
                }
            });
        }

        // Delete order
        const deleteResult = await pool.query(
            'DELETE FROM orders WHERE order_id = $1 RETURNING *', 
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to delete order' 
            });
        }

        res.json({
            success: true,
            message: `Order #${id} has been deleted successfully`,
            data: orderToDelete
        });
    } catch (err) {
        console.error('Error deleting order:', err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: 'Cannot delete order due to related records in other tables.',
                dbDetail: err.detail
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error', 
            error: err.message 
        });
    }
};

// Update order status only
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Received', 'Processing', 'In Production', 'Ready for Dispatch', 'Dispatched'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
                error: 'INVALID_STATUS'
            });
        }

        // Check if order exists and get current status
        const checkResult = await pool.query(
            'SELECT order_id, status FROM orders WHERE order_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const currentStatus = checkResult.rows[0].status;

        // Determine dispatch_actual_date based on status change
        let dispatchActualDateSql = null;
        if (status === 'Dispatched') {
            // Setting to Dispatched: set actual dispatch date to current timestamp
            dispatchActualDateSql = 'CURRENT_TIMESTAMP';
        } else if (currentStatus === 'Dispatched' && status !== 'Dispatched') {
            // Moving out of Dispatched: clear actual dispatch date
            dispatchActualDateSql = 'NULL';
        } else {
            // For other status changes, keep existing dispatch_actual_date
            dispatchActualDateSql = 'dispatch_actual_date';
        }

        // Update status and dispatch_actual_date
        const updateResult = await pool.query(
            `UPDATE orders 
            SET status = $1, 
                dispatch_actual_date = ${dispatchActualDateSql},
                last_updated = CURRENT_TIMESTAMP
            WHERE order_id = $2
            RETURNING *`,
            [status, id]
        );

        // Fetch the complete order with client info (using same query as getOrder)
        const fullOrderResult = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.dispatch_committed_date,
                o.dispatch_actual_date,
                o.payment_received_date,
                o.payment_due_date,
                o.invoice_amount,
                o.order_quantity,
                o.cup_specs_id,
                o.design_volume_weight,
                o.dispatch_location,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name,
                cs.label as cup_spec_label,
                cs.volume as cup_volume,
                cs.diameter as cup_diameter,
                cs.type as cup_type,
                cs.weight as cup_weight,
                -- Payment overdue flag
                CASE 
                    WHEN o.payment_due_date IS NOT NULL 
                    AND o.payment_received_date IS NULL 
                    AND o.payment_due_date::date < CURRENT_DATE
                    THEN true 
                    ELSE false 
                END as is_payment_overdue
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            LEFT JOIN cupspecs cs ON o.cup_specs_id = cs.label_id
            WHERE o.order_id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: fullOrderResult.rows[0]
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

