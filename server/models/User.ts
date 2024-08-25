import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const User = mongoose.model('User', UserSchema);
export default User;
