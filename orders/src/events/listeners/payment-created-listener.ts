import {
	Listener,
	NotFoundError,
	OrderStatus,
	PaymentCreatedEvent,
	Subjects,
} from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { QueueGroupNames } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	readonly queueGroupName = QueueGroupNames.ORDERS_SERVICE;

	onMessage = async (data: PaymentCreatedEvent['data'], message: Message) => {
		const { orderId } = data;

		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}

		order.set({ status: OrderStatus.Complete });
		await order.save();

		message.ack();
	};
}
