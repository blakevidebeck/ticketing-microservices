import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { QueueGroupNames } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	readonly queueGroupName = QueueGroupNames.EXPIRATION_SERVICE;

	onMessage = async (data: OrderCreatedEvent['data'], message: Message) => {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

		await expirationQueue.add({ orderId: data.id }, { delay });

		message.ack();
	};
}
