import { ExpirationCompleteEvent, Publisher, Subjects } from '@bvidebecktickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
