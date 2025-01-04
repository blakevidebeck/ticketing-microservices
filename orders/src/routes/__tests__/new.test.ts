import request from 'supertest';
import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';
import { Order } from '../../models/Order';

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

it('creates a ticket with valid inputs', async () => {
	let orders = await Order.find({});
	expect(orders.length).toEqual(0);

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({ ticketId: '' })
		.expect(201);

	orders = await Order.find({});
	expect(orders.length).toEqual(1);
});

// it('publishes a create event', async () => {
// 	let tickets = await Ticket.find({});
// 	expect(tickets.length).toEqual(0);

// 	await request(app)
// 		.post('/api/tickets')
// 		.set('Cookie', global.signin())
// 		.send({ title: 'Ticket', price: 10 })
// 		.expect(201);

// 	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
// 	expect(natsWrapper.client.publish).toHaveBeenCalledWith(
// 		'ticket:created',
// 		expect.anything(),
// 		expect.anything()
// 	);
// });
