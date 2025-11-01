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
                o.payment_received_date,
                o.invoice_amount,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            ORDER BY o.order_date DESC, o.order_id DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single order by ID
export const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.payment_received_date,
                o.invoice_amount,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            WHERE o.order_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        res.json({ success: true, data: result.rows[0] });
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
            payment_received_date, 
            invoice_amount, 
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

        if (!design_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Design ID is required',
                error: 'MISSING_DESIGN_ID'
            });
        }

        // Validate that client and design exist
        const [clientCheck, designCheck] = await Promise.all([
            pool.query('SELECT client_id FROM clients WHERE client_id = $1', [client_id]),
            pool.query('SELECT design_id FROM designs WHERE design_id = $1', [design_id])
        ]);

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client not found',
                error: 'CLIENT_NOT_FOUND'
            });
        }

        if (designCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Design not found',
                error: 'DESIGN_NOT_FOUND'
            });
        }

        // Convert empty strings to null for optional fields
        const orderDate = order_date || new Date().toISOString();
        const dispatchDate = dispatch_date || null;
        const paymentDate = payment_received_date || null;
        const invoiceAmt = invoice_amount || null;
        const orderSpecs = specs || null;
        const orderRemarks = remarks || null;
        const orderCreatedBy = created_by || null;

        const result = await pool.query(
            `INSERT INTO orders (
                design_id, 
                client_id, 
                order_date, 
                dispatch_date, 
                payment_received_date, 
                invoice_amount, 
                specs, 
                remarks,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                design_id,
                client_id,
                orderDate,
                dispatchDate,
                paymentDate,
                invoiceAmt,
                orderSpecs,
                orderRemarks,
                orderCreatedBy
            ]
        );

        // Fetch the complete order with client info
        const fullOrderResult = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.payment_received_date,
                o.invoice_amount,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            WHERE o.order_id = $1`,
            [result.rows[0].order_id]
        );

        res.json({ success: true, data: fullOrderResult.rows[0] });
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
            payment_received_date, 
            invoice_amount, 
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

        if (!design_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Design ID is required',
                error: 'MISSING_DESIGN_ID'
            });
        }

        // Validate that client and design exist
        const [clientCheck, designCheck] = await Promise.all([
            pool.query('SELECT client_id FROM clients WHERE client_id = $1', [client_id]),
            pool.query('SELECT design_id FROM designs WHERE design_id = $1', [design_id])
        ]);

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client not found',
                error: 'CLIENT_NOT_FOUND'
            });
        }

        if (designCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Design not found',
                error: 'DESIGN_NOT_FOUND'
            });
        }

        // Update order
        const updateResult = await pool.query(
            `UPDATE orders 
            SET 
                design_id = $1,
                client_id = $2,
                order_date = $3,
                dispatch_date = $4,
                payment_received_date = $5,
                invoice_amount = $6,
                specs = $7,
                remarks = $8,
                last_updated = CURRENT_TIMESTAMP
            WHERE order_id = $9
            RETURNING *`,
            [
                design_id,
                client_id,
                order_date || null,
                dispatch_date || null,
                payment_received_date || null,
                invoice_amount || null,
                specs || null,
                remarks || null,
                id
            ]
        );

        // Fetch the complete order with client info
        const fullOrderResult = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.payment_received_date,
                o.invoice_amount,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
            WHERE o.order_id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: fullOrderResult.rows[0]
        });
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

        // Update status
        const updateResult = await pool.query(
            `UPDATE orders 
            SET status = $1, last_updated = CURRENT_TIMESTAMP
            WHERE order_id = $2
            RETURNING *`,
            [status, id]
        );

        // Fetch the complete order with client info
        const fullOrderResult = await pool.query(
            `SELECT 
                o.order_id,
                o.design_id,
                o.client_id,
                o.order_date,
                o.dispatch_date,
                o.payment_received_date,
                o.invoice_amount,
                o.specs,
                o.remarks,
                o.created_by,
                o.last_updated,
                COALESCE(o.status, 'Received') as status,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone,
                d.name as design_name
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.client_id
            LEFT JOIN designs d ON o.design_id = d.design_id
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

