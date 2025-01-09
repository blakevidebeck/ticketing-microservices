import { OrderCreatedEvent, OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCreatedListener(natsWrapper.client);

	// create a fake data event
	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: '123',
		version: 0,
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 10,
		},
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message };
};

it('creates a new order', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure a ticket was created
	const order = await Order.findById(data.id);

	expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});
