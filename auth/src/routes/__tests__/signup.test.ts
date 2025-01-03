import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
});

it('returns a 400 for an invalid email', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test',
			password: 'password',
		})
		.expect(400);
});

it('returns a 400 for an invalid password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'p',
		})
		.expect(400);
});

it('returns a 400 for a missing email and password', async () => {
	await request(app).post('/api/users/signup').send({ email: 'test@test.com' }).expect(400);
	await request(app).post('/api/users/signup').send({ password: 'password' }).expect(400);
});

it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);

	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('sets a cookie after succesful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);

	expect(response.get('Set-Cookie')).toBeDefined();
});
