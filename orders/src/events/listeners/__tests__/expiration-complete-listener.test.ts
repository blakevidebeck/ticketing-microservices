import { ExpirationCompleteEvent, OrderStatus, TicketCreatedEvent } from '@bvidebecktickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';

const setup = async () => {
	// Create an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
	});
	await ticket.save();

	// Create and save a order
	const order = Order.build({
		ticket,
		userId: 'asdf',
		status: OrderStatus.Created,
		expiresAt: new Date(),
	});
	await order.save();

	// create a fake data event
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};

	// create a fake message object
	const message: Message = {
		ack: jest.fn(),
	} as unknown as Message;

	return { listener, data, message, ticket, order };
};

it('updates the order status to cancelled', async () => {
	const { listener, data, message, order } = await setup();

	await listener.onMessage(data, message);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an orderCancelled event', async () => {
	const { listener, data, message, order, ticket } = await setup();

	await listener.onMessage(data, message);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const orderUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

	expect(orderUpdatedData.id).toEqual(data.orderId);
});

it('acks the message', async () => {
	const { listener, data, message } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, message);

	// write assertions to make sure ack function is called
	expect(message.ack).toHaveBeenCalledTimes(1);
});
