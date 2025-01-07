import { OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { TicketDoc } from './ticket';

export { OrderStatus };

// An interface that describes the properties that are required to create a new order
interface OrderAttrs {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	ticket: TicketDoc;
}

// An interface that describes the properties that a order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
	build: (attrs: OrderAttrs) => OrderDoc;
}

// An interface that describes the properties that a order document has
interface OrderDoc extends mongoose.Document, OrderAttrs {
	version: number;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
			required: false,
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ticket',
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
orderSchema.pre('save', function (done) {
	this.$where = {
		version: this.get('version') - 1,
	};

	done();
});

orderSchema.statics.build = (attrs: OrderAttrs) => new Order(attrs);

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
