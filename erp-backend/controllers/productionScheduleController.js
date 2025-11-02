import pool from '../db.js';

// Get all production schedules for a machine
export const getProductionSchedules = async (req, res) => {
  try {
    const { machineId } = req.query;
    
    let query = `
      SELECT 
        ps.schedule_id as id,
        ps.machine_id,
        ps.machine_id as machineId,
        ps.order_id as orderId,
        ps.order_number as orderNumber,
        ps.quantity,
        ps.start_time as startTime,
        ps.end_time as endTime,
        ps.operator,
        ps.shift,
        ps.status,
        ps.remarks,
        ps.created_at as createdAt,
        ps.updated_at as updatedAt,
        o.client_id as client_id,
        c.name as client_name
      FROM production_schedules ps
      LEFT JOIN orders o ON ps.order_id = o.order_id
      LEFT JOIN clients c ON o.client_id = c.client_id
    `;
    
    const params = [];
    if (machineId) {
      query += ' WHERE ps.machine_id = $1';
      params.push(machineId);
    }
    
    query += ' ORDER BY ps.start_time ASC';
    
    const result = await pool.query(query, params);
    
    // Convert timestamps to ISO strings for frontend
    const schedules = result.rows.map(schedule => ({
      ...schedule,
      startTime: schedule.starttime ? new Date(schedule.starttime).toISOString() : (schedule.startTime ? new Date(schedule.startTime).toISOString() : null),
      endTime: schedule.endtime ? new Date(schedule.endtime).toISOString() : (schedule.endTime ? new Date(schedule.endTime).toISOString() : null),
      createdAt: schedule.createdat ? new Date(schedule.createdat).toISOString() : (schedule.createdAt ? new Date(schedule.createdAt).toISOString() : null),
      updatedAt: schedule.updatedat ? new Date(schedule.updatedat).toISOString() : (schedule.updatedAt ? new Date(schedule.updatedAt).toISOString() : null),
    }));
    
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.error('Error fetching production schedules:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single production schedule
export const getProductionSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        ps.schedule_id as id,
        ps.machine_id,
        ps.machine_id as machineId,
        ps.order_id as orderId,
        ps.order_number as orderNumber,
        ps.quantity,
        ps.start_time as startTime,
        ps.end_time as endTime,
        ps.operator,
        ps.shift,
        ps.status,
        ps.remarks,
        ps.created_at as createdAt,
        ps.updated_at as updatedAt
      FROM production_schedules ps
      WHERE ps.schedule_id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Production schedule not found' 
      });
    }
    
    const schedule = result.rows[0];
    schedule.startTime = new Date(schedule.starttime || schedule.startTime).toISOString();
    schedule.endTime = new Date(schedule.endtime || schedule.endTime).toISOString();
    schedule.createdAt = new Date(schedule.createdat || schedule.createdAt).toISOString();
    schedule.updatedAt = new Date(schedule.updatedat || schedule.updatedAt).toISOString();
    
    res.json({ success: true, data: schedule });
  } catch (err) {
    console.error('Error fetching production schedule:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create new production schedule
export const createProductionSchedule = async (req, res) => {
  try {
    const {
      machineId,
      machine_id,
      orderId,
      order_id,
      orderNumber,
      quantity,
      startTime,
      endTime,
      operator,
      shift,
      status,
      remarks
    } = req.body;
    
    // Validate required fields
    const finalMachineId = machineId || machine_id;
    const finalOrderId = orderId || order_id;
    
    if (!finalMachineId) {
      return res.status(400).json({
        success: false,
        message: 'Machine ID is required'
      });
    }
    
    if (!finalOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }
    
    // Validate machine exists
    const machineCheck = await pool.query(
      'SELECT machine_id FROM machines WHERE machine_id = $1',
      [finalMachineId]
    );
    
    if (machineCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }
    
    // Validate order exists
    const orderCheck = await pool.query(
      'SELECT order_id FROM orders WHERE order_id = $1',
      [finalOrderId]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Insert schedule
    const result = await pool.query(
      `INSERT INTO production_schedules (
        machine_id, order_id, order_number, quantity, 
        start_time, end_time, operator, shift, status, remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        finalMachineId,
        finalOrderId,
        orderNumber,
        quantity,
        new Date(startTime),
        new Date(endTime),
        operator || null,
        shift || null,
        status || 'planned',
        remarks || null
      ]
    );
    
    const newSchedule = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Production schedule created successfully',
      data: {
        id: newSchedule.schedule_id,
        machineId: newSchedule.machine_id,
        machine_id: newSchedule.machine_id,
        orderId: newSchedule.order_id,
        orderNumber: newSchedule.order_number,
        quantity: newSchedule.quantity,
        startTime: newSchedule.start_time.toISOString(),
        endTime: newSchedule.end_time.toISOString(),
        operator: newSchedule.operator,
        shift: newSchedule.shift,
        status: newSchedule.status,
        remarks: newSchedule.remarks,
        createdAt: newSchedule.created_at.toISOString(),
        updatedAt: newSchedule.updated_at.toISOString()
      }
    });
  } catch (err) {
    console.error('Error creating production schedule:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create production schedule',
      error: err.message 
    });
  }
};

// Update production schedule
export const updateProductionSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      machineId,
      machine_id,
      orderId,
      order_id,
      orderNumber,
      quantity,
      startTime,
      endTime,
      operator,
      shift,
      status,
      remarks
    } = req.body;
    
    // Check if schedule exists
    const checkResult = await pool.query(
      'SELECT schedule_id FROM production_schedules WHERE schedule_id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Production schedule not found'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (machineId !== undefined || machine_id !== undefined) {
      const finalMachineId = machineId || machine_id;
      updates.push(`machine_id = $${paramCount++}`);
      values.push(finalMachineId);
    }
    
    if (orderId !== undefined || order_id !== undefined) {
      const finalOrderId = orderId || order_id;
      updates.push(`order_id = $${paramCount++}`);
      values.push(finalOrderId);
    }
    
    if (orderNumber !== undefined) {
      updates.push(`order_number = $${paramCount++}`);
      values.push(orderNumber);
    }
    
    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }
    
    if (startTime !== undefined) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(new Date(startTime));
    }
    
    if (endTime !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(new Date(endTime));
    }
    
    if (operator !== undefined) {
      updates.push(`operator = $${paramCount++}`);
      values.push(operator || null);
    }
    
    if (shift !== undefined) {
      updates.push(`shift = $${paramCount++}`);
      values.push(shift || null);
    }
    
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    
    if (remarks !== undefined) {
      updates.push(`remarks = $${paramCount++}`);
      values.push(remarks || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const updateQuery = `
      UPDATE production_schedules 
      SET ${updates.join(', ')}
      WHERE schedule_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, values);
    const updatedSchedule = result.rows[0];
    
    res.json({
      success: true,
      message: 'Production schedule updated successfully',
      data: {
        id: updatedSchedule.schedule_id,
        machineId: updatedSchedule.machine_id,
        machine_id: updatedSchedule.machine_id,
        orderId: updatedSchedule.order_id,
        orderNumber: updatedSchedule.order_number,
        quantity: updatedSchedule.quantity,
        startTime: updatedSchedule.start_time.toISOString(),
        endTime: updatedSchedule.end_time.toISOString(),
        operator: updatedSchedule.operator,
        shift: updatedSchedule.shift,
        status: updatedSchedule.status,
        remarks: updatedSchedule.remarks,
        createdAt: updatedSchedule.created_at.toISOString(),
        updatedAt: updatedSchedule.updated_at.toISOString()
      }
    });
  } catch (err) {
    console.error('Error updating production schedule:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update production schedule',
      error: err.message 
    });
  }
};

// Delete production schedule
export const deleteProductionSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM production_schedules WHERE schedule_id = $1 RETURNING *',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Production schedule not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Production schedule deleted successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting production schedule:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete production schedule',
      error: err.message 
    });
  }
};

