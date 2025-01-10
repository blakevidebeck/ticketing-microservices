import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';

it('has a route handler listening to /api/payments for post requests', async () => {
	const res = await request(app).post('/api/payments').send({});

	expect(res.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/payments').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
	const res = await request(app).post('/api/payments').set('Cookie', global.signin()).send({});

	expect(res.status).not.toEqual(401);
});

it('returns an error if an invalid orderId or token is provided', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ orderId: '', token: '123' })
		.expect(400);
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ orderId: '123', token: '' })
		.expect(400);
});

it('throws a 404 if no order found', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ orderId: new mongoose.Types.ObjectId().toHexString(), token: '123' })
		.expect(404);
});

it('throws a 401 if no order does not belong to user', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.AwaitingPayment,
		version: 0,
		price: 10,
	});
	order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ orderId: order.id, token: '123' })
		.expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		status: OrderStatus.Cancelled,
		version: 0,
		price: 10,
	});
	order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({ orderId: order.id, token: '123' })
		.expect(400);
});
