import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/Ticket';
import { Order } from '../models/Order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			// This is optional to make sure the user is passing in a valid mongoDb id, but this could be dangerous as we are always going to make an assumption that the other services are using mongo
			// .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('ticketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		// Find the ticket the user is trying to order in the db
		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		// Make sure the ticket is not already reserved
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// Calculate an expiration date for this order
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		// Build the order and save it to the db
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		});
		await order.save();

		// Publish an event saying that an order has been created
		try {
			await new OrderCreatedPublisher(natsWrapper.client).publish({
				id: order.id,
				userId: order.userId,
				status: order.status,
				expiresAt: order.expiresAt.toISOString(),
				ticket: {
					id: ticket.id,
					price: ticket.price,
				},
			});
		} catch (error) {
			console.log('Order created error', error);
		}

		res.status(201).send(order);
	}
);

export { router as createOrderRouter };
