import express from 'express';
import {
  getShiftScheduleForMonth,
  saveShiftSchedule,
  updateShiftAssignment
} from '../controllers/shiftScheduleController.js';

const router = express.Router();
router.get('/', getShiftScheduleForMonth);
router.post('/', saveShiftSchedule);
router.put('/assignment', updateShiftAssignment);
export default router;
