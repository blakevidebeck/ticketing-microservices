import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
	// Handle no JWT_KEY
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}

	try {
		await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
		console.log('Connected to MongoDb on port 27017');
	} catch (error) {
		console.error('Connecting to mongo error', { error });
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000');
	});
};

start();
