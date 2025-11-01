import express from 'express';
import { 
    getClients, 
    getClient, 
    addClient, 
    updateClient, 
    deleteClient 
} from '../controllers/clientController.js';

const router = express.Router();

// Get all clients
router.get('/', getClients);

// Get single client by ID
router.get('/:id', getClient);

// Add new client
router.post('/', addClient);

// Update client
router.put('/:id', updateClient);

// Delete client
router.delete('/:id', deleteClient);

export default router;

