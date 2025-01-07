import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// An interface that describes the properties that are required to create a new ticket
interface TicketAttrs {
	id: string;
	title: string;
	price: number;
}

type TicketEvent = Pick<TicketDoc, 'id' | 'version'>;

// An interface that describes the properties that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
	build: (attrs: TicketAttrs) => TicketDoc;
	findByEvent: (event: Pick<TicketDoc, 'id' | 'version'>) => Promise<TicketDoc | null>;
}

// An interface that describes the properties that a ticket document has
export interface TicketDoc extends mongoose.Document, Omit<TicketAttrs, 'id'> {
	isReserved(): Promise<boolean>;
	version: number;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
		versionKey: 'version',
	}
);

// increment the document version when the record is saved (optimistic concurrency control)
ticketSchema.pre('save', function (done) {
	this.$where = {
		version: this.get('version') - 1,
	};

	done();
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	const { id } = attrs;
	return new Ticket({
		_id: id,
		...attrs,
	});
};

/**
 * Find the last ticket with the last version. If the events were processed out of order then this will fail and it should put the event back in the queue
 */
ticketSchema.statics.findByEvent = (event: TicketEvent) => {
	const { id, version } = event;
	return Ticket.findOne({ _id: id, version: version - 1 });
};

/**
 * Run query to look at all orders. Find an order where the ticket is the ticket we just found and the orders status is not cancelled.
 *  If we find an order from this that means the ticket is reserved
 */
ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
		},
	});

	return !!existingOrder;
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
