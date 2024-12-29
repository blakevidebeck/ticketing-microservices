import request from 'supertest';
import { app } from '../../app';

it('returns details about the current user', async () => {
	const res = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);

	const cookie = res.get('Set-Cookie');

	if (!cookie) {
		throw new Error('Cookie not set after signup');
	}

	const response = await request(app)
		.get('/api/users/currentuser')
		.set('Cookie', cookie)
		.send()
		.expect(200);

	expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('returns null if not authenticated', async () => {
	const response = await request(app).get('/api/users/currentuser').send().expect(200);

	expect(response.body.currentUser).toEqual(null);
});
