import { Publisher, Subjects, PaymentCreatedEvent } from '@bvidebecktickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
