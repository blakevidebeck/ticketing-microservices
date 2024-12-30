import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new ticket
interface TicketAttrs {
	title: string;
	price: number;
	userId: string;
}

// An interface that describes the properties that a ticket model has
interface ticketModel extends mongoose.Model<TicketDoc> {
	build: (attrs: TicketAttrs) => TicketDoc;
}

// An interface that describes the properties that a ticket document has
interface TicketDoc extends mongoose.Document, TicketAttrs {}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	}
);

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);

export const Ticket = mongoose.model<TicketDoc, ticketModel>('Ticket', ticketSchema);
