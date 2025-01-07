import {
	Listener,
	NotFoundError,
	OrderCancelledEvent,
	OrderCreatedEvent,
	Subjects,
} from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { QueueGroupNames } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancalled;
	readonly queueGroupName = QueueGroupNames.TICKETS_SERVICE;

	onMessage = async (data: OrderCancelledEvent['data'], message: Message) => {
		// Find the ticket that the order is cancelling
		const ticket = await Ticket.findById(data.ticket.id);

		// If no ticket, throw error
		if (!ticket) {
			throw new NotFoundError();
		}

		// Mark the ticket as being cancelled by setting its orderId property to null
		ticket.set({ orderId: undefined });

		// save the ticket
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId,
		});

		// ack the message
		message.ack();
	};
}
