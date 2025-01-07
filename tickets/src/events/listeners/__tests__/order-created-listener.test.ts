import { OrderCreatedEvent, OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCreatedListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

	// create a fake data event
	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: '123',
		version: 0,
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message, ticket };
};

it('sets the orderId of the ticket', async () => {
	const { listener, data, message, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure a ticket was created
	const updatedticket = await Ticket.findById(data.ticket.id);

	expect(updatedticket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});

it('publishes a ticket updated event', async () => {
	const { listener, data, message, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(ticketUpdatedData.orderId).toEqual(data.id);
});
