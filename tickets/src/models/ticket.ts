import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties that are required to create a new ticket
interface TicketAttrs {
	title: string;
	price: number;
	userId: string;
}

// An interface that describes the properties that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
	build: (attrs: TicketAttrs) => TicketDoc;
}

// An interface that describes the properties that a ticket document has
interface TicketDoc extends mongoose.Document, TicketAttrs {
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
			},
		},
		versionKey: 'version',
	}
);

ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket(attrs);

export const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
