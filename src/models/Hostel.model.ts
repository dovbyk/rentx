import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHostel extends Document {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string; 
  owner: Types.ObjectId; // Reference to the vendor
  amenities: string[]; // List of available amenities (e.g., WiFi, laundry)
  images: string[];
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude] for GeoJSON
    description: string;
  };
  isApproved: boolean; 
}


const HostelSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true, default: 'Nepal' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    amenities: [{ type: String }],
    images: [{ type: String }],

    location: {
      type: {
        type: String,
        enum: ['Point'], // 'location.type' must be 'Point'
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      description: String,
    },
    
    isApproved: { type: Boolean, default: false, select: true }, 
  },
  {
    timestamps: true,
  }
);

//Create a Geospatial Index
// This is critical for efficient search queries like "find hostels near me"
HostelSchema.index({ location: '2dsphere' });

const Hostel = mongoose.model<IHostel>('Hostel', HostelSchema);
export default Hostel;