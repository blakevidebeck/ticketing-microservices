import {
	NotFoundError,
	requireAuth,
	UnauthorizedError,
	validateRequest,
} from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put(
	'/api/tickets/:id',
	[
		body('title').not().isEmpty().withMessage('Title is not valid'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
	],
	requireAuth,
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;

		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new UnauthorizedError('User ids do not match');
		}

		ticket.set({ title, price });
		await ticket.save();

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
