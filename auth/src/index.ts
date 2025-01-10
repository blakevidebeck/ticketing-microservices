import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
	console.log('Starting up...');

	// Handle no JWT_KEY
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}

	// Handle no MONGO_URI
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDb on port 27017');
	} catch (error) {
		console.error('Connecting to mongo error', { error });
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000');
	});
};

start();
