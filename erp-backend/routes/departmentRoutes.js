import express from 'express';
import { 
    getDepartments, 
    getDepartment, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment
} from '../controllers/departmentController.js';

const router = express.Router();

// Get all departments
router.get('/', getDepartments);

// Get single department by ID
router.get('/:id', getDepartment);

// Add new department
router.post('/', addDepartment);

// Update department
router.put('/:id', updateDepartment);

// Delete department
router.delete('/:id', deleteDepartment);

export default router;

