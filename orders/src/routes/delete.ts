import {
	NotFoundError,
	OrderStatus,
	requireAuth,
	UnauthorizedError,
} from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/Order';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
	const { orderId } = req.params;

	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser!.id) {
		throw new UnauthorizedError('Not authrorized to view this order');
	}

	order.status = OrderStatus.Cancelled;
	await order.save();

	// Publish an event saying that an order has been cancelled
	// TODO

	res.send(order);
});

export { router as deleteOrderRouter };
