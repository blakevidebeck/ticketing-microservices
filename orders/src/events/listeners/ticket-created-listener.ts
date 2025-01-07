import { Listener, Subjects, TicketCreatedEvent } from '@bvidebecktickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { QueueGroupNames } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	readonly queueGroupName = QueueGroupNames.ORDERS_SERVICE;

	onMessage = async (data: TicketCreatedEvent['data'], message: Message) => {
		const { id, title, price } = data;

		// Don't need the version here as it should always be 0
		const ticket = Ticket.build({ id, title, price });
		await ticket.save();

		message.ack();
	};
}
