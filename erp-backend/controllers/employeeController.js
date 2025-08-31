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
    
    // Check if employee exists
    const checkResult = await pool.query('SELECT * FROM employees WHERE emp_code = $1', [emp_code]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    const employeeToDelete = checkResult.rows[0];
    
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
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
