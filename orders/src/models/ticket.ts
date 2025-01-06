import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// An interface that describes the properties that are required to create a new ticket
interface TicketAttrs {
	id: string;
	title: string;
	price: number;
}

// An interface that describes the properties that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
	build: (attrs: TicketAttrs) => TicketDoc;
}

// An interface that describes the properties that a ticket document has
export interface TicketDoc extends mongoose.Document, Omit<TicketAttrs, 'id'> {
	isReserved(): Promise<boolean>;
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
	}
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	const { id } = attrs;
	return new Ticket({
		_id: id,
		...attrs,
	});
};
ticketSchema.methods.isReserved = async function () {
	// Run query to look at all orders. Find an order where the ticket is the ticket we just found and the orders status is not cancelled.
	// If we find an order from this that means the ticket is reserved
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
		},
	});

	return !!existingOrder;
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
