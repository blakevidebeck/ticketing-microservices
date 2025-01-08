import {
	ExpirationCompleteEvent,
	Listener,
	NotFoundError,
	OrderStatus,
	Subjects,
} from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupNames } from './queue-group-name';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
	readonly queueGroupName = QueueGroupNames.ORDERS_SERVICE;

	onMessage = async (data: ExpirationCompleteEvent['data'], message: Message) => {
		const { orderId } = data;

		const order = await Order.findById(orderId).populate('ticket');

		if (!order) {
			throw new NotFoundError();
		}

		order.set({ status: OrderStatus.Cancelled });
		await order.save();

		await new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});

		message.ack();
	};
}
