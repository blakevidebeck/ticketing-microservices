import request from 'supertest';
import { app } from '../../app';

import { Order, OrderStatus } from '../../models/Order';
import mongoose from 'mongoose';
import { Ticket } from '../../models/Ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders for post requests', async () => {
	const res = await request(app).post('/api/orders').send({});

	expect(res.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/orders').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
	const res = await request(app).post('/api/orders').set('Cookie', global.signin()).send({});

	expect(res.status).not.toEqual(401);
});

it('returns an error if an invalid ticketId is provided', async () => {
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: '' })
		.expect(400);
});

it('returns an error if the ticket does not exist', async () => {
	const ticketId = new mongoose.Types.ObjectId().toHexString();

	let orders = await Order.find({});
	expect(orders.length).toEqual(0);

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId })
		.expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: 'asdf',
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('creates an order if existing order status was cancelled', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: 'asdf',
		status: OrderStatus.Cancelled,
		expiresAt: new Date(),
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('creates an order if no existing order', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('publishes a create order event', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
	expect(natsWrapper.client.publish).toHaveBeenCalledWith(
		'order:created',
		expect.anything(),
		expect.anything()
	);
});
