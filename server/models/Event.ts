import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    datetime: { type: Number, required: true },
    color: { type: String, default: 'blue' },
});

const Event = mongoose.model('Event', EventSchema);
export default Event;
