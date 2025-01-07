import { Listener, NotFoundError, Subjects, TicketUpdatedEvent } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QueueGroupNames } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	readonly queueGroupName = QueueGroupNames.ORDERS_SERVICE;

	onMessage = async (data: TicketUpdatedEvent['data'], message: Message) => {
		const { title, price } = data;

		const ticket = await Ticket.findByEvent(data);

		if (!ticket) {
			throw new NotFoundError();
		}

		// If a ticket was found, we can update it and then save it which in turn will cause the version to be updated as it updates on every save
		ticket.set({ title, price });
		await ticket.save();

		message.ack();
	};
}
