import pool from "../db.js";

// Get all designs
export const getDesigns = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM designs ORDER BY name ASC"
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching designs:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single design by ID
export const getDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM designs WHERE design_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Design not found'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching design:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new design
export const addDesign = async (req, res) => {
    try {
        const { name, file_url, remarks } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Design name is required',
                error: 'MISSING_DESIGN_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const designFileUrl = file_url && file_url.trim() !== '' ? file_url.trim() : null;
        const designRemarks = remarks && remarks.trim() !== '' ? remarks.trim() : null;

        const result = await pool.query(
            `INSERT INTO designs (name, file_url, remarks)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name.trim(), designFileUrl, designRemarks]
        );

        res.json({
            success: true,
            message: 'Design added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding design:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add design',
            error: err.message
        });
    }
};

// Update design
export const updateDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, file_url, remarks } = req.body;

        // Check if design exists
        const checkResult = await pool.query(
            'SELECT design_id FROM designs WHERE design_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Design not found'
            });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Design name is required',
                error: 'MISSING_DESIGN_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const designFileUrl = file_url && file_url.trim() !== '' ? file_url.trim() : null;
        const designRemarks = remarks && remarks.trim() !== '' ? remarks.trim() : null;

        const result = await pool.query(
            `UPDATE designs
            SET name = $1, file_url = $2, remarks = $3
            WHERE design_id = $4
            RETURNING *`,
            [name.trim(), designFileUrl, designRemarks, id]
        );

        res.json({
            success: true,
            message: 'Design updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating design:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

// Delete design
export const deleteDesign = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if design exists
        const checkResult = await pool.query(
            'SELECT * FROM designs WHERE design_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Design not found'
            });
        }

        const designToDelete = checkResult.rows[0];

        // Check for dependent records (orders)
        const ordersCheck = await pool.query(
            'SELECT COUNT(*)::int AS count FROM orders WHERE design_id = $1',
            [id]
        );

        const orderCount = ordersCheck.rows[0]?.count || 0;

        if (orderCount > 0) {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: `Cannot delete design '${designToDelete.name}' because it is used in ${orderCount} order(s). Delete or reassign those orders first.`,
                details: { orders: orderCount }
            });
        }

        // Delete design
        const deleteResult = await pool.query(
            'DELETE FROM designs WHERE design_id = $1 RETURNING *',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete design'
            });
        }

        res.json({
            success: true,
            message: `Design '${designToDelete.name}' has been deleted successfully`,
            data: designToDelete
        });
    } catch (err) {
        console.error('Error deleting design:', err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: 'Cannot delete design due to related records in other tables.',
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
