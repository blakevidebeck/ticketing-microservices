import { OrderCancelledEvent, Publisher, Subjects } from '@bvidebecktickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancalled;
}
