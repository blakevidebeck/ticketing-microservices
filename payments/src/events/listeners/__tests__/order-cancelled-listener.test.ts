import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Cancelled,
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 10,
	});
	await order.save();

	// create a fake data event
	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 0,
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
		},
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message, order };
};

it('updates the status of the order', async () => {
	const { listener, data, message, order } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure a ticket was cancelled
	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});
