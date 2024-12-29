import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
	id: string;
	email: string;
}

declare global {
	namespace Express {
		interface Request {
			currentUser?: UserPayload;
		}
	}
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
	// Check if user has a JWT cookie
	if (!req.session?.jwt) {
		return next();
	}

	try {
		// Check if JWT is valid
		const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
		// If cookie and JWT and is valid then set on req.currentUser
		req.currentUser = payload;
		return next();
	} catch (error) {}

	next();
};
