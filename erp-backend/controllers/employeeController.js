import pool from "../db.js";

// Get all employees
export const getEmployees = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees ORDER BY emp_code ASC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add new employee
export const addEmployee = async (req, res) => {
  let { emp_code, name, role, contact, email, address, joining_date } = req.body;
  // Convert empty strings to null for optional fields
  role = role === '' ? null : role;
  contact = contact === '' ? null : contact;
  email = email === '' ? null : email;
  address = address === '' ? null : address;
  joining_date = joining_date === '' ? null : joining_date;
    try {
        // First check if employee code already exists
        const existingEmployee = await pool.query(
            'SELECT emp_code FROM employees WHERE emp_code = $1',
            [emp_code]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Employee with code '${emp_code}' already exists. Please use a different employee code.`,
                error: 'DUPLICATE_EMP_CODE'
            });
        }

        const result = await pool.query(
            `INSERT INTO employees (emp_code, name, role, contact, email, address, joining_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [emp_code, name, role, contact, email, address, joining_date]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error adding employee:', err);
        
        // Handle different types of database errors
        if (err.code === '23505') { // PostgreSQL unique violation error code
            return res.status(400).json({ 
                success: false, 
                message: `Employee with code '${emp_code}' already exists. Please use a different employee code.`,
                error: 'DUPLICATE_EMP_CODE'
            });
        }
        
        // Handle other validation errors
        if (err.code === '23502') { // PostgreSQL not null violation
            return res.status(400).json({ 
                success: false, 
                message: 'Required fields are missing. Please fill in all mandatory fields.',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }
        
        // Generic error for other cases
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add employee. Please try again.',
            error: err.message 
        });
    }
};

// Get single employee by emp_code
export const getEmployee = async (req, res) => {
  try {
    const { emp_code } = req.params;
    
    const result = await pool.query('SELECT * FROM employees WHERE emp_code = $1', [emp_code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Update employee by emp_code
export const updateEmployee = async (req, res) => {
  try {
    const { emp_code } = req.params;
    const { name, role, email, contact, joining_date, address } = req.body;
    
    // Check if employee exists
    const checkResult = await pool.query('SELECT emp_code FROM employees WHERE emp_code = $1', [emp_code]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // Update employee
    const updateResult = await pool.query(
      `UPDATE employees 
       SET name = $1, role = $2, email = $3, contact = $4, joining_date = $5, address = $6
       WHERE emp_code = $7
       RETURNING *`,
      [name, role, email, contact, joining_date, address, emp_code]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to update employee' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Delete employee by emp_code
export const deleteEmployee = async (req, res) => {
  try {
    const { emp_code } = req.params;
  const { force } = req.query;
    
    // Check if employee exists
    const checkResult = await pool.query('SELECT * FROM employees WHERE emp_code = $1', [emp_code]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    const employeeToDelete = checkResult.rows[0];

    // Pre-check for dependent records that block deletion (no cascade)
    // attendance and punch_data are CASCADE, but shiftmapping and ot_approvals are NO ACTION
    const [shiftCountRes, otCountRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM shiftmapping WHERE emp_code = $1', [emp_code]),
      pool.query('SELECT COUNT(*)::int AS count FROM ot_approvals WHERE emp_code = $1', [emp_code])
    ]);

    const shiftCount = shiftCountRes.rows[0]?.count || 0;
    const otCount = otCountRes.rows[0]?.count || 0;

    if ((shiftCount > 0 || otCount > 0) && (force === 'true' || force === '1')) {
      // Perform hard delete in a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const delShift = await client.query('DELETE FROM shiftmapping WHERE emp_code = $1', [emp_code]);
        const delOt = await client.query('DELETE FROM ot_approvals WHERE emp_code = $1', [emp_code]);
        const delEmp = await client.query('DELETE FROM employees WHERE emp_code = $1', [emp_code]);
        await client.query('COMMIT');

        if (delEmp.rowCount === 0) {
          return res.status(400).json({ success: false, message: 'Failed to delete employee' });
        }

        return res.json({
          success: true,
          message: `Employee '${employeeToDelete.name}' (${emp_code}) hard-deleted successfully`,
          data: {
            employee: employeeToDelete,
            deleted: {
              shiftSchedules: delShift.rowCount,
              otApprovals: delOt.rowCount
            }
          }
        });
      } catch (txErr) {
        await client.query('ROLLBACK');
        console.error('Hard delete transaction failed:', txErr);
        return res.status(500).json({ success: false, message: 'Hard delete failed', error: txErr.message });
      } finally {
        client.release();
      }
    }

    if (shiftCount > 0 || otCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'FK_CONSTRAINT',
        message: `Cannot delete employee '${employeeToDelete.name}' (${emp_code}) because related records exist. Shift schedules: ${shiftCount}, OT approvals: ${otCount}.`,
        details: { shiftSchedules: shiftCount, otApprovals: otCount }
      });
    }
    
    // Delete employee
    const deleteResult = await pool.query('DELETE FROM employees WHERE emp_code = $1', [emp_code]);
    
    if (deleteResult.rowCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to delete employee' 
      });
    }
    
    res.json({
      success: true,
      message: `Employee '${employeeToDelete.name}' (${emp_code}) has been deleted successfully`,
      data: employeeToDelete
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    if (error.code === '23503') {
      // Foreign key violation fallback
      return res.status(409).json({
        success: false,
        error: 'FK_CONSTRAINT',
        message: 'Cannot delete employee due to related records in other tables. Remove or reassign those records first.',
        dbDetail: error.detail
      });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get dependency counts for an employee (shiftmapping, ot_approvals)
export const getEmployeeDependencies = async (req, res) => {
  try {
    const { emp_code } = req.params;
    // Ensure employee exists
    const empRes = await pool.query('SELECT emp_code FROM employees WHERE emp_code = $1', [emp_code]);
    if (empRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [shiftCountRes, otCountRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM shiftmapping WHERE emp_code = $1', [emp_code]),
      pool.query('SELECT COUNT(*)::int AS count FROM ot_approvals WHERE emp_code = $1', [emp_code])
    ]);

    const shiftSchedules = shiftCountRes.rows[0]?.count || 0;
    const otApprovals = otCountRes.rows[0]?.count || 0;

    return res.json({ success: true, data: { shiftSchedules, otApprovals } });
  } catch (error) {
    console.error('Error getting employee dependencies:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
