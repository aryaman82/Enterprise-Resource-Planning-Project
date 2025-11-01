import express from 'express';
import { 
    getOrders, 
    getOrder, 
    addOrder, 
    updateOrder, 
    deleteOrder,
    updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

// Get all orders
router.get('/', getOrders);

// Add new order
router.post('/', addOrder);

// Update order status only (must come before /:id route)
router.patch('/:id/status', updateOrderStatus);

// Get single order by ID
router.get('/:id', getOrder);

// Update order
router.put('/:id', updateOrder);

// Delete order
router.delete('/:id', deleteOrder);

export default router;

