import { Publisher, Subjects, TicketUpdatedEvent } from '@bvidebecktickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
