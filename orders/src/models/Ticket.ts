import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new ticket
interface TicketAttrs {
	title: string;
	price: number;
}

// An interface that describes the properties that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
	build: (attrs: TicketAttrs) => TicketDoc;
}

// An interface that describes the properties that a ticket document has
export interface TicketDoc extends mongoose.Document, TicketAttrs {}

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

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
