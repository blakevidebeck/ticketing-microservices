import { Listener, NotFoundError, Subjects, TicketUpdatedEvent } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
import { QueueGroupNames } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	readonly queueGroupName = QueueGroupNames.ORDERS_SERVICE;

	onMessage = async (data: TicketUpdatedEvent['data'], message: Message) => {
		const { id, title, price } = data;

		const ticket = await Ticket.findById(id);

		if (!ticket) {
			throw new NotFoundError();
		}

		ticket.set({ title, price });
		await ticket.save();

		message.ack();
	};
}
