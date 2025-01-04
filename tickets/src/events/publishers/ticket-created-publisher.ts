import { Publisher, Subjects, TicketCreatedEvent } from '@bvidebecktickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
