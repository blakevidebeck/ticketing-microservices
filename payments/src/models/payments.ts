import { OrderStatus } from '@bvidebecktickets/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

// An interface that describes the properties that are required to create a new payment
interface PaymentAttrs {
	orderId: string;
	stripeId: string;
}

// An interface that describes the properties that a payment model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
	build: (attrs: PaymentAttrs) => PaymentDoc;
}

// An interface that describes the properties that a payment document has
interface PaymentDoc extends mongoose.Document, PaymentAttrs {}

const paymentSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
		},
		stripeId: {
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

paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
	return new Payment(attrs);
};

export const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);
