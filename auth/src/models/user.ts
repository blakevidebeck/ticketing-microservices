import mongoose from 'mongoose';
import { Password } from '../services/password';

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

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashedPassword = await Password.toHash(this.get('email'));

		this.set('password', hashedPassword);
	}
	done();
});
userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
