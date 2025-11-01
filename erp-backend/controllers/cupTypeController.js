import pool from "../db.js";

// Get all cup types with design information
export const getCupTypes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                cs.label_id,
                cs.label,
                cs.diameter,
                cs.volume,
                cs.type,
                cs.weight,
                cs.design_id,
                d.name as design_name,
                d.file_url as design_file_url
            FROM cupspecs cs
            LEFT JOIN designs d ON cs.design_id = d.design_id
            ORDER BY cs.label ASC, d.name ASC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching cup types:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single cup type by ID
export const getCupType = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
                cs.label_id,
                cs.label,
                cs.diameter,
                cs.volume,
                cs.type,
                cs.weight,
                cs.design_id,
                d.name as design_name,
                d.file_url as design_file_url,
                d.remarks as design_remarks
            FROM cupspecs cs
            LEFT JOIN designs d ON cs.design_id = d.design_id
            WHERE cs.label_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cup type not found'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching cup type:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new cup type
export const addCupType = async (req, res) => {
    try {
        const { label_id, label, diameter, volume, type, design_id } = req.body;

        // Validate required fields
        if (!label_id || !label || label_id.trim() === '' || label.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Label ID and Label are required',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (!diameter || !volume || diameter <= 0 || volume <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Diameter and Volume must be positive numbers',
                error: 'INVALID_SPECS'
            });
        }

        // Validate design_id if provided
        if (design_id) {
            const designCheck = await pool.query(
                'SELECT design_id FROM designs WHERE design_id = $1',
                [design_id]
            );

            if (designCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Design not found',
                    error: 'DESIGN_NOT_FOUND'
                });
            }
        }

        // Check if label_id already exists
        const existingCheck = await pool.query(
            'SELECT label_id FROM cupspecs WHERE label_id = $1',
            [label_id.trim()]
        );

        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Cup type with label ID '${label_id}' already exists`,
                error: 'DUPLICATE_LABEL_ID'
            });
        }

        // Convert empty strings to null for optional fields
        const cupType = type && type.trim() !== '' ? type.trim() : null;
        const designId = design_id ? parseInt(design_id) : null;

        // Weight will be automatically calculated by the trigger
        const result = await pool.query(
            `INSERT INTO cupspecs (label_id, label, diameter, volume, type, design_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [label_id.trim(), label.trim(), diameter, volume, cupType, designId]
        );

        // Fetch the complete cup type with design info
        const cupTypeId = result.rows[0].label_id;
        return getCupType({ params: { id: cupTypeId } }, res);
    } catch (err) {
        console.error('Error adding cup type:', err);
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Cup type with this label ID already exists',
                error: 'DUPLICATE_LABEL_ID'
            });
        }
        if (err.code === '23503') {
            return res.status(404).json({
                success: false,
                message: 'Design not found',
                error: 'DESIGN_NOT_FOUND'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add cup type',
            error: err.message
        });
    }
};

// Update cup type
export const updateCupType = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, diameter, volume, type, design_id } = req.body;

        // Check if cup type exists
        const checkResult = await pool.query(
            'SELECT label_id FROM cupspecs WHERE label_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cup type not found'
            });
        }

        // Validate required fields if provided
        if (label !== undefined && (!label || label.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Label cannot be empty',
                error: 'INVALID_LABEL'
            });
        }

        if (diameter !== undefined && diameter <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Diameter must be a positive number',
                error: 'INVALID_DIAMETER'
            });
        }

        if (volume !== undefined && volume <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Volume must be a positive number',
                error: 'INVALID_VOLUME'
            });
        }

        // Validate design_id if provided
        if (design_id) {
            const designCheck = await pool.query(
                'SELECT design_id FROM designs WHERE design_id = $1',
                [design_id]
            );

            if (designCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Design not found',
                    error: 'DESIGN_NOT_FOUND'
                });
            }
        }

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (label !== undefined) {
            updates.push(`label = $${paramIndex++}`);
            values.push(label.trim());
        }
        if (diameter !== undefined) {
            updates.push(`diameter = $${paramIndex++}`);
            values.push(diameter);
        }
        if (volume !== undefined) {
            updates.push(`volume = $${paramIndex++}`);
            values.push(volume);
        }
        if (type !== undefined) {
            updates.push(`type = $${paramIndex++}`);
            values.push(type && type.trim() !== '' ? type.trim() : null);
        }
        if (design_id !== undefined) {
            updates.push(`design_id = $${paramIndex++}`);
            values.push(design_id ? parseInt(design_id) : null);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE cupspecs
            SET ${updates.join(', ')}
            WHERE label_id = $${paramIndex}
            RETURNING *`,
            values
        );

        // Fetch the complete cup type with design info
        return getCupType({ params: { id } }, res);
    } catch (err) {
        console.error('Error updating cup type:', err);
        if (err.code === '23503') {
            return res.status(404).json({
                success: false,
                message: 'Design not found',
                error: 'DESIGN_NOT_FOUND'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update cup type',
            error: err.message
        });
    }
};

// Delete cup type
export const deleteCupType = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if cup type exists
        const checkResult = await pool.query(
            'SELECT * FROM cupspecs WHERE label_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cup type not found'
            });
        }

        const cupTypeToDelete = checkResult.rows[0];

        // Check for dependent records (orders, cups, printedcups)
        const [ordersCheck, cupsCheck, printedCupsCheck] = await Promise.all([
            pool.query('SELECT COUNT(*)::int AS count FROM orders WHERE cup_specs_id = $1', [id]),
            pool.query('SELECT COUNT(*)::int AS count FROM cups WHERE cup_id = $1', [id]),
            pool.query('SELECT COUNT(*)::int AS count FROM printedcups WHERE printed_cup_id = $1', [id])
        ]);

        const orderCount = ordersCheck.rows[0]?.count || 0;
        const cupCount = cupsCheck.rows[0]?.count || 0;
        const printedCupCount = printedCupsCheck.rows[0]?.count || 0;
        const totalDependencies = orderCount + cupCount + printedCupCount;

        if (totalDependencies > 0) {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: `Cannot delete cup type '${cupTypeToDelete.label}' because it is used in ${totalDependencies} record(s).`,
                details: { 
                    orders: orderCount, 
                    cups: cupCount, 
                    printed_cups: printedCupCount 
                }
            });
        }

        // Delete cup type
        const deleteResult = await pool.query(
            'DELETE FROM cupspecs WHERE label_id = $1 RETURNING *',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete cup type'
            });
        }

        res.json({
            success: true,
            message: `Cup type '${cupTypeToDelete.label}' has been deleted successfully`,
            data: cupTypeToDelete
        });
    } catch (err) {
        console.error('Error deleting cup type:', err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: 'Cannot delete cup type due to related records in other tables.',
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

