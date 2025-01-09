import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
	// Handle no JWT_KEY
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	// Handle no MONGO_URI
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	// Handle no NATS_CLUSTER_ID
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}
	// Handle no NATS_CLIENT_ID
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	// Handle no NATS_URL
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}

	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		);
		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed');
			process.exit();
		});
		process.on('SIGINT', () => natsWrapper.client.close());
		process.on('SIGTERM', () => natsWrapper.client.close());

		new OrderCreatedListener(natsWrapper.client).listen();
		new OrderCancelledListener(natsWrapper.client).listen();

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
