import request from 'supertest';
import { app } from '../../app';

import { Ticket } from '../../models/Ticket';

const buildticket = async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	return ticket;
};

it('returns an array of orders for a particular user ', async () => {
	// Create 3 tickets
	const ticket1 = await buildticket();
	const ticket2 = await buildticket();
	const ticket3 = await buildticket();

	const user1 = global.signin();
	const user2 = global.signin();

	// Create 1 order as user #1
	await request(app)
		.post('/api/orders')
		.set('Cookie', user1)
		.send({ ticketId: ticket1.id })
		.expect(201);

	// Create 2 orders as user #2
	const { body: orderOne } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket2.id })
		.expect(201);
	const { body: orderTwo } = await request(app)
		.post('/api/orders')
		.set('Cookie', user2)
		.send({ ticketId: ticket3.id })
		.expect(201);

	// Make req to get orders for user #2
	const res = await request(app).get('/api/orders').set('Cookie', user2).expect(200);

	// Make sure we only got the orders for user #2
	expect(res.body).toHaveLength(2);
	expect(res.body[0].id).toEqual(orderOne.id);
	expect(res.body[0].ticket.id).toEqual(ticket2.id);
	expect(res.body[1].ticket.id).toEqual(ticket3.id);
});

it('returns an empty array if no orders', async () => {
	const res = await request(app).get('/api/orders').set('Cookie', global.signin()).expect(200);

	expect(res.body).toHaveLength(0);
});
