import { requireAuth, validateRequest } from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/tickets',
	[
		body('title').not().isEmpty().withMessage('Title is not valid'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
	],
	requireAuth,
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;

		const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
		await ticket.save();

		try {
			await new TicketCreatedPublisher(natsWrapper.client).publish({
				id: ticket.id,
				title: ticket.title,
				price: ticket.price,
				userId: ticket.userId,
			});
		} catch (error) {
			console.log('Ticket created error', error);
		}

		res.status(201).send(ticket);
	}
);

export { router as createTicketRouter };
