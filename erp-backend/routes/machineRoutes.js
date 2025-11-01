import express from 'express';
import { 
    getMachines, 
    getMachine, 
    addMachine, 
    updateMachine, 
    deleteMachine
} from '../controllers/machineController.js';

const router = express.Router();

// Get all machines (optionally filtered by department_id query param)
router.get('/', getMachines);

// Get single machine by ID
router.get('/:id', getMachine);

// Add new machine
router.post('/', addMachine);

// Update machine
router.put('/:id', updateMachine);

// Delete machine
router.delete('/:id', deleteMachine);

export default router;

