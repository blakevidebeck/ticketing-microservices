import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupNames } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	// Event subject to listen for
	readonly subject = Subjects.OrderCreated;

	// If more than one payment service only one of them in the queue will listen for the event. Otherwise if no queueGroupName then both of them will listen for the event
	readonly queueGroupName = QueueGroupNames.PAYMENTS_SERVICE;

	onMessage = async (data: OrderCreatedEvent['data'], message: Message) => {
		// Listen for the event and then build a new order

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
