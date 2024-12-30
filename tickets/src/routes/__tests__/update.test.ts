import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({ title: 'Ticket', price: 10 })
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app).put(`/api/tickets/${id}`).send({ title: 'Ticket', price: 10 }).expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
	const res = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({ title: 'Ticket', price: 10 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', global.signin())
		.send({ title: 'Ticket', price: 20 })
		.expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
	const cookie = global.signin();

	const res = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'Ticket', price: 10 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'Ticket', price: -10 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({ title: '', price: 10 })
		.expect(400);
});

it('returns a 200 if the user provides valids inputs', async () => {
	const cookie = global.signin();

	const res = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'Ticket', price: 10 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${res.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'New title', price: 20 })
		.expect(200);

	const ticketResponse = await request(app).get(`/api/tickets/${res.body.id}`).send().expect(200);

	expect(ticketResponse.body.title).toEqual('New title');
	expect(ticketResponse.body.price).toEqual(20);
});
