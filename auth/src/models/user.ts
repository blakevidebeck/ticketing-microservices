import mongoose from 'mongoose';
import { PasswordManager } from '../services/password';

// An interface that describes the properties that are required to create a new user
interface UserAttrs {
	email: string;
	password: string;
}

// An interface that describes the properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
	build: (attrs: UserAttrs) => UserDoc;
}

// An interface that describes the properties that a user document has
interface UserDoc extends mongoose.Document, UserAttrs {}

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.password;
				delete ret.__v;
			},
		},
	}
);

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashedPassword = await PasswordManager.toHash(this.get('password'));

		this.set('password', hashedPassword);
	}
	done();
});
userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
