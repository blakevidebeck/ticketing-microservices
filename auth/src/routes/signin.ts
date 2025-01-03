import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { PasswordManager } from '../services/password';
import { BadRequestError, validateRequest } from '@bvidebecktickets/common';

const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password').trim().notEmpty().withMessage('You must supply a passwword'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			throw new BadRequestError('No user found with that email');
		}

		// If user found then compare the passwords
		const passwordsMatch = await PasswordManager.compare(existingUser.password, password);

		if (!passwordsMatch) {
			throw new BadRequestError('Incorrect password');
		}

		// Generate JWT
		const userJwt = jwt.sign(
			{
				id: existingUser.id,
				email: existingUser.email,
			},
			process.env.JWT_KEY!
		);
		// Store it on session object
		req.session = {
			jwt: userJwt,
		};

		res.status(200).send(existingUser);
	}
);

export { router as signinRouter };
