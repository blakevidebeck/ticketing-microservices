import { OrderCreatedEvent, Publisher, Subjects } from '@bvidebecktickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
