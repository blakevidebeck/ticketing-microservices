import { NotFoundError, requireAuth, UnauthorizedError } from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/Order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
	const { orderId } = req.params;

	const order = await Order.findById(orderId).populate('ticket');

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser!.id) {
		throw new UnauthorizedError('Not authrorized to view this order');
	}

	res.send(order);
});

export { router as showOrderRouter };
