import { useState } from 'react';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const NewTicket = () => {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');

	const { doRequest, errors } = useRequest({
		method: 'post',
		url: '/api/tickets',
		body: { title, price },
		onSuccess: () => Router.push('/'),
	});

	const onBlur = () => {
		const value = parseFloat(price);

		if (isNaN(value)) {
			return;
		}

		setPrice(value.toFixed(2));
	};

	const onSubmit = async e => {
		e.preventDefault();

		await doRequest();
	};

	return (
		<div>
			<h1>Create a new ticket</h1>

			<form onSubmit={onSubmit}>
				<div className='form-group'>
					<label>Title</label>
					<input className='form-control' value={title} onChange={e => setTitle(e.target.value)} />
				</div>
				<div className='form-group'>
					<label>Price</label>
					<input
						className='form-control'
						value={price}
						onChange={e => setPrice(e.target.value)}
						onBlur={onBlur}
					/>
				</div>
				{errors}
				<button className='btn btn-primary'>Submit</button>
			</form>
		</div>
	);
};

export default NewTicket;
