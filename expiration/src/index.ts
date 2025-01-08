import { natsWrapper } from './nats-wrapper';

const start = async () => {
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
	} catch (error) {
		console.error('Connecting to nats error', { error });
	}
};

start();
