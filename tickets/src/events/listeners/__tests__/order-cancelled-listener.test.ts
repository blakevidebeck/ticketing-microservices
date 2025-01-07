import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled.listener';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = new mongoose.Types.ObjectId().toHexString();

	// Create and save a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});

	ticket.set({ orderId });
	await ticket.save();

	// create a fake data event
	const data: OrderCancelledEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message, ticket };
};

it('sets the orderId of the ticket', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure a ticket was cancelled
	const updatedticket = await Ticket.findById(data.ticket.id);

	expect(updatedticket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});

it('publishes a ticket cancelled event', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(ticketUpdatedData.orderId).not.toBeDefined();
});
