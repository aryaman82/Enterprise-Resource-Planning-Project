import pool from "../db.js";

// Get all machines
export const getMachines = async (req, res) => {
    try {
        const { department_id } = req.query;
        let query = `
            SELECT m.*, d.name as department_name 
            FROM machines m
            LEFT JOIN departments d ON m.department_id = d.department_id
        `;
        const params = [];

        if (department_id) {
            query += ' WHERE m.department_id = $1';
            params.push(department_id);
        }

        query += ' ORDER BY d.name ASC, m.name ASC';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single machine by ID
export const getMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT m.*, d.name as department_name 
             FROM machines m
             LEFT JOIN departments d ON m.department_id = d.department_id
             WHERE m.machine_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching machine:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new machine
export const addMachine = async (req, res) => {
    try {
        const { 
            department_id, 
            name, 
            machine_code, 
            machine_type, 
            manufacturer, 
            model_number, 
            serial_number, 
            installation_date, 
            capacity_per_hour, 
            status,
            remarks 
        } = req.body;

        // Validate required fields
        if (!department_id) {
            return res.status(400).json({
                success: false,
                message: 'Department ID is required',
                error: 'MISSING_DEPARTMENT_ID'
            });
        }

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Machine name is required',
                error: 'MISSING_MACHINE_NAME'
            });
        }

        // Check if department exists
        const deptCheck = await pool.query(
            'SELECT department_id FROM departments WHERE department_id = $1',
            [department_id]
        );

        if (deptCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found',
                error: 'DEPARTMENT_NOT_FOUND'
            });
        }

        // Convert empty strings to null for optional fields
        const code = machine_code && machine_code.trim() !== '' ? machine_code.trim() : null;
        const type = machine_type && machine_type.trim() !== '' ? machine_type.trim() : null;
        const mfg = manufacturer && manufacturer.trim() !== '' ? manufacturer.trim() : null;
        const model = model_number && model_number.trim() !== '' ? model_number.trim() : null;
        const serial = serial_number && serial_number.trim() !== '' ? serial_number.trim() : null;
        const installDate = installation_date || null;
        const capacity = capacity_per_hour ? parseInt(capacity_per_hour) : null;
        const machineStatus = status && status.trim() !== '' ? status.trim() : 'idle';
        const machineRemarks = remarks && remarks.trim() !== '' ? remarks.trim() : null;

        const result = await pool.query(
            `INSERT INTO machines (
                department_id, name, machine_code, machine_type, manufacturer, 
                model_number, serial_number, installation_date, capacity_per_hour, 
                status, remarks
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [department_id, name.trim(), code, type, mfg, model, serial, installDate, capacity, machineStatus, machineRemarks]
        );

        res.json({
            success: true,
            message: 'Machine added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding machine:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'Machine with this code already exists',
                error: 'DUPLICATE_MACHINE_CODE'
            });
        }
        if (err.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID',
                error: 'INVALID_DEPARTMENT_ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add machine',
            error: err.message
        });
    }
};

// Update machine
export const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            department_id, 
            name, 
            machine_code, 
            machine_type, 
            manufacturer, 
            model_number, 
            serial_number, 
            installation_date, 
            capacity_per_hour, 
            status,
            is_active,
            remarks 
        } = req.body;

        // Check if machine exists
        const checkResult = await pool.query(
            'SELECT machine_id FROM machines WHERE machine_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Machine name is required',
                error: 'MISSING_MACHINE_NAME'
            });
        }

        // If department_id is being updated, check if it exists
        if (department_id) {
            const deptCheck = await pool.query(
                'SELECT department_id FROM departments WHERE department_id = $1',
                [department_id]
            );

            if (deptCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found',
                    error: 'DEPARTMENT_NOT_FOUND'
                });
            }
        }

        // Convert empty strings to null for optional fields
        const code = machine_code && machine_code.trim() !== '' ? machine_code.trim() : null;
        const type = machine_type && machine_type.trim() !== '' ? machine_type.trim() : null;
        const mfg = manufacturer && manufacturer.trim() !== '' ? manufacturer.trim() : null;
        const model = model_number && model_number.trim() !== '' ? model_number.trim() : null;
        const serial = serial_number && serial_number.trim() !== '' ? serial_number.trim() : null;
        const installDate = installation_date || null;
        const capacity = capacity_per_hour ? parseInt(capacity_per_hour) : null;
        const machineStatus = status && status.trim() !== '' ? status.trim() : 'idle';
        const isActive = is_active !== undefined ? is_active : true;
        const machineRemarks = remarks && remarks.trim() !== '' ? remarks.trim() : null;

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (department_id) {
            updateFields.push(`department_id = $${paramIndex++}`);
            updateValues.push(department_id);
        }

        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(name.trim());
        
        updateFields.push(`machine_code = $${paramIndex++}`);
        updateValues.push(code);
        
        updateFields.push(`machine_type = $${paramIndex++}`);
        updateValues.push(type);
        
        updateFields.push(`manufacturer = $${paramIndex++}`);
        updateValues.push(mfg);
        
        updateFields.push(`model_number = $${paramIndex++}`);
        updateValues.push(model);
        
        updateFields.push(`serial_number = $${paramIndex++}`);
        updateValues.push(serial);
        
        updateFields.push(`installation_date = $${paramIndex++}`);
        updateValues.push(installDate);
        
        updateFields.push(`capacity_per_hour = $${paramIndex++}`);
        updateValues.push(capacity);
        
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(machineStatus);
        
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(isActive);
        
        updateFields.push(`remarks = $${paramIndex++}`);
        updateValues.push(machineRemarks);
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        const query = `UPDATE machines SET ${updateFields.join(', ')} WHERE machine_id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, updateValues);

        res.json({
            success: true,
            message: 'Machine updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating machine:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'Machine with this code already exists',
                error: 'DUPLICATE_MACHINE_CODE'
            });
        }
        if (err.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID',
                error: 'INVALID_DEPARTMENT_ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

// Delete machine
export const deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if machine exists
        const checkResult = await pool.query(
            'SELECT * FROM machines WHERE machine_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        const machineToDelete = checkResult.rows[0];

        // Delete machine
        const deleteResult = await pool.query(
            'DELETE FROM machines WHERE machine_id = $1 RETURNING *',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete machine'
            });
        }

        res.json({
            success: true,
            message: `Machine '${machineToDelete.name}' has been deleted successfully`,
            data: machineToDelete
        });
    } catch (err) {
        console.error('Error deleting machine:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

