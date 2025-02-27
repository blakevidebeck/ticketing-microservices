import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
declare global {
	var signin: (id?: string) => string[];
}

global.console = {
	...console,
	// uncomment to ignore a specific log level
	log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};

jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
	process.env.JWT_KEY = '1234';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	jest.clearAllMocks();

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

global.signin = (id?: string) => {
	// Build a JWT payload {id, email}
	const payload = { id: id || new mongoose.Types.ObjectId().toHexString(), email: 'test@test.com' };

	// Create the JWT!
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// Build session object {jwt: MY_JWT}
	const session = { jwt: token };

	// Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	// Take JSON and encode to base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	// Return a string thats the cookie with the encoded data
	return [`session=${base64}`];
};
