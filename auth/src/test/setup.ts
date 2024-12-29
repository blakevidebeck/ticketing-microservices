import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
	process.env.JWT_KEY = '1234';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	if (mongoose.connection.db) {
		const collections = await mongoose.connection.db.collections();

		for (let collection of collections) {
			await collection.deleteMany({});
		}
	}
});

afterAll(async () => {
	if (mongo) {
		await mongo.stop();
	}
	await mongoose.connection.close();
});
