import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const SignUpPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const { doRequest, errors } = useRequest({
		method: 'post',
		url: '/api/users/signup',
		body: { email, password },
		onSuccess: () => Router.push('/'),
	});

	const onSubmit = async e => {
		e.preventDefault();

		await doRequest();
	};

	return (
		<form onSubmit={onSubmit}>
			<h1>Sign up</h1>

			<div className='form-group'>
				<label>Email Address</label>
				<input
					type='email'
					className='form-control'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
			</div>

			<div className='form-group'>
				<label>Password</label>
				<input
					type='password'
					className='form-control'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
			</div>

			{errors}

			<button className='btn btn-primary' onClick={onSubmit}>
				Sign up
			</button>
		</form>
	);
};

export default SignUpPage;
