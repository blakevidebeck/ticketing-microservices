import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupNames } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	readonly queueGroupName = QueueGroupNames.PAYMENTS_SERVICE;

	onMessage = async (data: OrderCreatedEvent['data'], message: Message) => {
		const order = Order.build({
			id: data.id,
			status: data.status,
			price: data.ticket.price,
			userId: data.userId,
			version: data.version,
		});
		await order.save();

		// ack the message
		message.ack();
	};
}
