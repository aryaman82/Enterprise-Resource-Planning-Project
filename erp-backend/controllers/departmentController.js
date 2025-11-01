import pool from "../db.js";

// Get all departments
export const getDepartments = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM departments ORDER BY name ASC"
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single department by ID
export const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM departments WHERE department_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching department:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new department
export const addDepartment = async (req, res) => {
    try {
        const { name, description, location, manager } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required',
                error: 'MISSING_DEPARTMENT_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const deptDescription = description && description.trim() !== '' ? description.trim() : null;
        const deptLocation = location && location.trim() !== '' ? location.trim() : null;
        const deptManager = manager && manager.trim() !== '' ? manager.trim() : null;

        const result = await pool.query(
            `INSERT INTO departments (name, description, location, manager)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [name.trim(), deptDescription, deptLocation, deptManager]
        );

        res.json({
            success: true,
            message: 'Department added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error adding department:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'Department with this name already exists',
                error: 'DUPLICATE_DEPARTMENT_NAME'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add department',
            error: err.message
        });
    }
};

// Update department
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location, manager, is_active } = req.body;

        // Check if department exists
        const checkResult = await pool.query(
            'SELECT department_id FROM departments WHERE department_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required',
                error: 'MISSING_DEPARTMENT_NAME'
            });
        }

        // Convert empty strings to null for optional fields
        const deptDescription = description && description.trim() !== '' ? description.trim() : null;
        const deptLocation = location && location.trim() !== '' ? location.trim() : null;
        const deptManager = manager && manager.trim() !== '' ? manager.trim() : null;
        const isActive = is_active !== undefined ? is_active : true;

        const result = await pool.query(
            `UPDATE departments
            SET name = $1, description = $2, location = $3, manager = $4, 
                is_active = $5, updated_at = CURRENT_TIMESTAMP
            WHERE department_id = $6
            RETURNING *`,
            [name.trim(), deptDescription, deptLocation, deptManager, isActive, id]
        );

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating department:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'Department with this name already exists',
                error: 'DUPLICATE_DEPARTMENT_NAME'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};

// Delete department
export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if department exists
        const checkResult = await pool.query(
            'SELECT * FROM departments WHERE department_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const departmentToDelete = checkResult.rows[0];

        // Check for dependent records (machines)
        const machinesCheck = await pool.query(
            'SELECT COUNT(*)::int AS count FROM machines WHERE department_id = $1',
            [id]
        );

        const machineCount = machinesCheck.rows[0]?.count || 0;

        if (machineCount > 0) {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: `Cannot delete department '${departmentToDelete.name}' because it has ${machineCount} machine(s). Delete or reassign those machines first.`,
                details: { machines: machineCount }
            });
        }

        // Delete department
        const deleteResult = await pool.query(
            'DELETE FROM departments WHERE department_id = $1 RETURNING *',
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete department'
            });
        }

        res.json({
            success: true,
            message: `Department '${departmentToDelete.name}' has been deleted successfully`,
            data: departmentToDelete
        });
    } catch (err) {
        console.error('Error deleting department:', err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'FK_CONSTRAINT',
                message: 'Cannot delete department due to related records in other tables.',
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

