import Router from 'next/router';
import { useEffect, useState } from 'react';

import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);

	const { doRequest, errors } = useRequest({
		method: 'post',
		url: '/api/payments',
		body: { orderId: order.id },
		onSuccess: () => Router.push(`/orders`),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();

		const timerId = setInterval(() => {
			findTimeLeft();
		}, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, [order]);

	if (timeLeft < 0) {
		return <div>Order expired</div>;
	}

	return (
		<div>
			<h1>Purchasing {order.ticket.title}</h1>
			<h4>Price: {order.ticket.price}</h4>
			<h4>Status: {order.status}</h4>
			<h4>Time Left until order expires: {timeLeft}</h4>

			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey='pk_test_51HOsNEEyPPY3KneievjLrbiZba6ElTrqHMdPZP0VPhQgt7BRpHN6mJTDhBmovqkoNeKPXrwTFSUKN4aBjYxddplC00S5CJGUV8'
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>

			{errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
	const { orderId } = context.query;

	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
