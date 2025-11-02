import express from 'express';
import {
  getProductionSchedules,
  getProductionSchedule,
  createProductionSchedule,
  updateProductionSchedule,
  deleteProductionSchedule
} from '../controllers/productionScheduleController.js';

const router = express.Router();

router.get('/', getProductionSchedules);
router.get('/:id', getProductionSchedule);
router.post('/', createProductionSchedule);
router.put('/:id', updateProductionSchedule);
router.delete('/:id', deleteProductionSchedule);

export default router;

