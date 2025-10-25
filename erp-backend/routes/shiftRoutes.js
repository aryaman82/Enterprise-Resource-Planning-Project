import express from 'express';
import { addShift, getAllShifts, deleteShift } from '../controllers/shiftController.js';

const router = express.Router();

// Get all shifts
router.get('/', getAllShifts);

// Add new shift
router.post('/', addShift);

// Delete shift
router.delete('/:id', deleteShift);

export default router;
