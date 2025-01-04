import { requireAuth, validateRequest } from '@bvidebecktickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

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
		res.send({});
	}
);

export { router as createOrderRouter };
