import request from 'supertest';
import { app } from '../../app';

import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns an order for a particular user ', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: '1',
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	// Create an order
	const order = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const res = await request(app)
		.get(`/api/orders/${order.body.id}`)
		.set('Cookie', user)
		.expect(200);

	expect(res.body.id).toEqual(order.body.id);
});

it('returns an error if no order found ', async () => {
	const orderId = new mongoose.Types.ObjectId().toHexString();

	await request(app).get(`/api/orders/${orderId}`).set('Cookie', global.signin()).expect(404);
});

it('returns an error if user not authorized to get ticket ', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: '1',
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	// Create an order
	const order = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app).get(`/api/orders/${order.body.id}`).set('Cookie', global.signin()).expect(401);
});
