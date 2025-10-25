import pool from '../db.js';

export const getAllShifts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shifts ORDER BY shift_code'
    );
    res.json({ success: true, shifts: result.rows });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
};

export const addShift = async (req, res) => {
  const { shiftCode, shiftName, startTime, endTime } = req.body;
  if (!shiftCode || !shiftName || (shiftCode !== 'OFF' && (!startTime || !endTime))) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO shifts (shift_code, shift_name, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [shiftCode, shiftName, shiftCode === 'OFF' ? null : startTime, shiftCode === 'OFF' ? null : endTime]
    );
    res.status(201).json({ success: true, shift: result.rows[0] });
  } catch (err) {
    console.error('Error adding shift:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
};

export const deleteShift = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Shift code is required.' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM shifts WHERE shift_code = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Shift not found.' });
    }
    res.json({ success: true, message: 'Shift deleted successfully', shift: result.rows[0] });
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
};
