import pool from '../db.js';

// Get shift schedule for a specific month
export const getShiftScheduleForMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }
    const query = `
      SELECT emp_code, date, shift_code
      FROM shiftmapping
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
    `;
    const result = await pool.query(query, [year, month]);
    const scheduleData = {};
    result.rows.forEach(row => {
      const day = new Date(row.date).getDate();
      const key = `${row.emp_code}_${year}-${month.toString().padStart(2, '0')}_${day}`;
      scheduleData[key] = row.shift_code;
    });
    res.json({ success: true, data: scheduleData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shift schedule', error: error.message });
  }
};

// Save entire shift schedule for a month
export const saveShiftSchedule = async (req, res) => {
  try {
    const { year, month, scheduleData } = req.body;
    if (!year || !month || !scheduleData) {
      return res.status(400).json({ success: false, message: 'Year, month, and schedule data are required' });
    }
    // Delete existing schedule for the month
    await pool.query(
      `DELETE FROM shiftmapping WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
      [year, month]
    );
    // Insert new schedule data
    const insertQuery = `INSERT INTO shiftmapping (emp_code, date, shift_code) VALUES ($1, $2, $3)`;
    for (const [key, shiftCode] of Object.entries(scheduleData)) {
      if (shiftCode && shiftCode !== '') {
        const [emp_code, datePart, day] = key.split('_');
        const date = `${datePart}-${day.padStart(2, '0')}`;
        await pool.query(insertQuery, [emp_code, date, shiftCode]);
      }
    }
    res.json({ success: true, message: 'Schedule saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save shift schedule', error: error.message });
  }
};

// Update a single shift assignment
export const updateShiftAssignment = async (req, res) => {
  try {
    const { employeeId, date, shiftCode } = req.body;
    if (!employeeId || !date) {
      return res.status(400).json({ success: false, message: 'Employee ID and date are required' });
    }
    if (!shiftCode || shiftCode === '') {
      await pool.query(`DELETE FROM shiftmapping WHERE emp_code = $1 AND date = $2`, [employeeId, date]);
    } else {
      const check = await pool.query(
        `SELECT mapping_id FROM shiftmapping WHERE emp_code = $1 AND date = $2`,
        [employeeId, date]
      );
      if (check.rows.length > 0) {
        await pool.query(
          `UPDATE shiftmapping SET shift_code = $1 WHERE emp_code = $2 AND date = $3`,
          [shiftCode, employeeId, date]
        );
      } else {
        await pool.query(
          `INSERT INTO shiftmapping (emp_code, date, shift_code) VALUES ($1, $2, $3)`,
          [employeeId, date, shiftCode]
        );
      }
    }
    res.json({ success: true, message: 'Shift assignment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update shift assignment', error: error.message });
  }
};
