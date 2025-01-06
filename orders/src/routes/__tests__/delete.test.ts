import request from 'supertest';
import { app } from '../../app';

import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { OrderStatus } from '@bvidebecktickets/common';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('cancels a order for a user ', async () => {
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

	await request(app).delete(`/api/orders/${order.body.id}`).set('Cookie', user).expect(200);

	const updatedOrder = await Order.findById(order.body.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('returns an error if no order found ', async () => {
	const orderId = new mongoose.Types.ObjectId().toHexString();

	await request(app).delete(`/api/orders/${orderId}`).set('Cookie', global.signin()).expect(404);
});

it('returns an error if user not authorized to delete ticket ', async () => {
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

	await request(app)
		.delete(`/api/orders/${order.body.id}`)
		.set('Cookie', global.signin())
		.expect(401);
});

it('publishes a cancel order event', async () => {
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

	await request(app).delete(`/api/orders/${order.body.id}`).set('Cookie', user).expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
	expect(natsWrapper.client.publish).toHaveBeenCalledWith(
		'order:created',
		expect.anything(),
		expect.anything()
	);
	expect(natsWrapper.client.publish).toHaveBeenCalledWith(
		'order:cancelled',
		expect.anything(),
		expect.anything()
	);
});
