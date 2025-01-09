import { OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

// An interface that describes the properties that are required to create a new order
interface OrderAttrs {
	id: string;
	status: OrderStatus;
	version: number;
	userId: string;
	price: number;
}

// An interface that describes the properties that a order model has
interface OrderModel extends mongoose.Model<OrderDoc> {
	build: (attrs: OrderAttrs) => OrderDoc;
}

// An interface that describes the properties that a order document has
interface OrderDoc extends mongoose.Document, Omit<OrderAttrs, 'id'> {}

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
		price: {
			type: Number,
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

orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	const { id } = attrs;
	return new Order({
		_id: id,
		...attrs,
	});
};

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
