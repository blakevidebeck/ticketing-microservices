import { TicketUpdatedEvent } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
	// Create an instance of the listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
	});
	await ticket.save();

	// create a fake data event
	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		title: 'new concert',
		price: 20,
		version: ticket.version + 1,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message, ticket };
};

it('finds, updates and saves a ticket', async () => {
	const { listener, data, message, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure a ticket was updated
	const updatedTicket = await Ticket.findById(ticket.id);

	expect(data!.title).toEqual(updatedTicket!.title);
	expect(data!.price).toEqual(updatedTicket!.price);
	expect(data!.version).toEqual(updatedTicket!.version);
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});

it('does not ack the message if the event has a skipped version', async () => {
	const { listener, data, message } = await setup();

	data.version = 10;

	try {
		// call the onMessage function with the data object + message object
		await listener.onMessage(data, message);
	} catch (error) {
		// write assertions to make sure ack function is not called
		expect(error).toBeTruthy();
	}
});
