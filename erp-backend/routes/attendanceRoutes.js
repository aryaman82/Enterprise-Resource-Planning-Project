import express from 'express';
import { getAttendanceForShift, getCurrentShiftInstances, getRecentShiftInstances } from '../controllers/attendanceController.js';

const router = express.Router();

// Query attendance for a given shift on a given date (YYYY-MM-DD)
router.get('/for-shift', getAttendanceForShift);

// Determine active shift instances at current IST time
router.get('/current-shifts', getCurrentShiftInstances);

// List current + previous shift instances with mapping counts
router.get('/recent-shift-instances', getRecentShiftInstances);

export default router;
