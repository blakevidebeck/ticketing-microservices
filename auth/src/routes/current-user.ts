import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
	// Check if user has a JWT cookie
	if (!req.session?.jwt) {
		return res.send({ currentUser: null });
	}

	try {
		// Check if JWT is valid
		const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
		// If cookie and JWT and is valid then return the info inside the JWT
		res.send({ currentUser: payload });
	} catch (error) {
		// If not valid JWT then return no user
		return res.send({ currentUser: null });
	}
});

export { router as currentUserRouter };
