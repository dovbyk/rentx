import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  hostel: Types.ObjectId; // Reference to the parent Hostel
  title: string;
  description: string;
  capacity: number;
  pricePerNight: number; 
  images: string[];
  isAvailable: boolean; 
}

const RoomSchema: Schema = new Schema(
  {
    // Link back to the Hostel model
    hostel: { 
      type: Schema.Types.ObjectId, 
      ref: 'Hostel', 
      required: true 
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    pricePerNight: { 
        type: Number, 
        required: true, 
        min: 0, 
        // Use a setter to ensure price is always rounded to 2 decimal places (NPR cents/paisa)
        set: (val: number) => Math.round(val * 100) / 100 
    },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model<IRoom>('Room', RoomSchema);
export default Room;