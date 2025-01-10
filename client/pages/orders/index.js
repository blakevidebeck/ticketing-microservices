const OrderIndex = ({ orders }) => {
	return (
		<ul>
			{orders.map(order => (
				<li>
					{order.ticket.title} - {order.status}
				</li>
			))}
		</ul>
	);
};

OrderIndex.getInitialProps = async (context, client, currentUser) => {
	const { data } = await client.get('/api/orders');

	return { orders: data };
};

export default OrderIndex;
