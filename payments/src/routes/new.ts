import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	UnauthorizedError,
	validateRequest,
} from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}

		if (order.userId !== req.currentUser!.id) {
			throw new UnauthorizedError('Order does not belong to user');
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for a cancelled order');
		}

		await stripe.charges.create({
			amount: order.price * 100,
			currency: 'usd',
			source: token,
			description: 'Microservices fake payment',
		});

		res.send({ success: true });
	}
);

export { router as createChargeRouter };
