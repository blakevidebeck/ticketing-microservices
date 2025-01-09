import {
	Listener,
	NotFoundError,
	OrderCancelledEvent,
	OrderStatus,
	Subjects,
} from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupNames } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancalled;
	readonly queueGroupName = QueueGroupNames.PAYMENTS_SERVICE;

	onMessage = async (data: OrderCancelledEvent['data'], message: Message) => {
		const order = await Order.findOne({ _id: data.id, version: data.version });

		if (!order) {
			throw new NotFoundError();
		}

		order.set({ status: OrderStatus.Cancelled });

		await order.save();

		// ack the message
		message.ack();
	};
}
