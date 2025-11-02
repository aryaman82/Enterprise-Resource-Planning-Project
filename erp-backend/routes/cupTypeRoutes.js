import express from 'express';
import {
    getCupTypes,
    getCupType,
    addCupType,
    updateCupType,
    deleteCupType
} from '../controllers/cupTypeController.js';

const router = express.Router();

router.get('/', getCupTypes);
router.get('/:id', getCupType);
router.post('/', addCupType);
router.put('/:id', updateCupType);
router.delete('/:id', deleteCupType);

export default router;

