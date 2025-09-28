import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

// ✅ COD order route (no auth for testing)
orderRouter.post('/cod', placeOrderCOD);

// Get user orders (keep auth)
orderRouter.get('/user', getUserOrders);

// Get all orders for seller (keep auth)
orderRouter.get('/seller', authSeller, getAllOrders);

export default orderRouter;
