import pool from "../db.js";

// Get all clients
export const getClients = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM clients ORDER BY name ASC"
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single client by ID
export const getClient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM clients WHERE client_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching client:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new client
export const addClient = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Client name is required',
                error: 'MISSING_CLIENT_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const clientEmail = email && email.trim() !== '' ? email.trim() : null;
        const clientPhone = phone && phone.trim() !== '' ? phone.trim() : null;

        const result = await pool.query(
            `INSERT INTO clients (name, email, phone)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name.trim(), clientEmail, clientPhone]
        );

        res.json({
            success: true,
            message: 'Client added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding client:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add client',
            error: err.message
        });
    }
};

// Update client
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        // Check if client exists
        const checkResult = await pool.query(
            'SELECT client_id FROM clients WHERE client_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Client name is required',
                error: 'MISSING_CLIENT_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const clientEmail = email && email.trim() !== '' ? email.trim() : null;
        const clientPhone = phone && phone.trim() !== '' ? phone.trim() : null;

        const result = await pool.query(
            `UPDATE clients
            SET name = $1, email = $2, phone = $3
            WHERE client_id = $4
            RETURNING *`,
            [name.trim(), clientEmail, clientPhone, id]
        );

        res.json({
            success: true,
            message: 'Client updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

// Delete client
export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if client exists
        const checkResult = await pool.query(
            'SELECT * FROM clients WHERE client_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const clientToDelete = checkResult.rows[0];

        // Check for dependent records (orders)
        const ordersCheck = await pool.query(
            'SELECT COUNT(*)::int AS count FROM orders WHERE client_id = $1',
            [id]
        );

        const orderCount = ordersCheck.rows[0]?.count || 0;

        if (orderCount > 0) {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: `Cannot delete client '${clientToDelete.name}' because they have ${orderCount} order(s). Delete or reassign those orders first.`,
                details: { orders: orderCount }
            });
        }

        // Delete client
        const deleteResult = await pool.query(
            'DELETE FROM clients WHERE client_id = $1 RETURNING *',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete client'
            });
        }

        res.json({
            success: true,
            message: `Client '${clientToDelete.name}' has been deleted successfully`,
            data: clientToDelete
        });
    } catch (err) {
        console.error('Error deleting client:', err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: 'Cannot delete client due to related records in other tables.',
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
