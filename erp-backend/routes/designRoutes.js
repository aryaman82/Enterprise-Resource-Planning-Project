import express from 'express';
import { 
    getDesigns, 
    getDesign, 
    addDesign, 
    updateDesign, 
    deleteDesign 
} from '../controllers/designController.js';

const router = express.Router();

// Get all designs
router.get('/', getDesigns);

// Get single design by ID
router.get('/:id', getDesign);

// Add new design
router.post('/', addDesign);

// Update design
router.put('/:id', updateDesign);

// Delete design
router.delete('/:id', deleteDesign);

export default router;

