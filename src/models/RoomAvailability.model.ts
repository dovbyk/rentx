import mongoose, { Schema, Document, Types } from 'mongoose';

// 1. Define the Room Availability Document Interface
export interface IRoomAvailability extends Document {
  room: Types.ObjectId;
  date: Date; // Important: Should be stored as YYYY-MM-DD (start of day)
  totalSlots: number; // The maximum capacity of the room on this date
  availableSlots: number; // The current available capacity (decremented upon booking)
}

// 2. Define the Room Availability Schema
const RoomAvailabilitySchema: Schema = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // Ensure time component is ignored for consistent tracking (e.g., store only YYYY-MM-DD)
      set: (val: Date) => {
        const d = new Date(val);
        d.setHours(0, 0, 0, 0); // Normalize to the start of the day
        return d;
      },
      get: (val: Date) => {
        const d = new Date(val);
        d.setHours(0, 0, 0, 0);
        return d;
      }
    },
    totalSlots: { type: Number, required: true, min: 0 },
    availableSlots: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Apply the date getter
    toObject: { getters: true },
  }
);

// 3. Create a Compound Unique Index (CRITICAL for preventing duplicate entries)
// This ensures only one availability record exists for a specific room on a specific day.
RoomAvailabilitySchema.index({ room: 1, date: 1 }, { unique: true });

// 4. Export the Model
const RoomAvailability = mongoose.model<IRoomAvailability>('RoomAvailability', RoomAvailabilitySchema);
export default RoomAvailability;