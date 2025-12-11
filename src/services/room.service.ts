import Room, { IRoom } from '../models/Room.model';
import Hostel, { IHostel } from '../models/Hostel.model';
import RoomAvailability, { IRoomAvailability } from '../models/RoomAvailability.model';
import { Types } from 'mongoose';


// Creates a new room associated with a specific hostel, and automatically initializes availability records for a range of dates.

const createRoomAndAvailability = async (
  hostelId: string, 
  roomData: any, 
  ownerId: Types.ObjectId
): Promise<IRoom> => {
  // 1. Authorization Check: Verify the hostel exists and belongs to the owner.
  const hostel = await Hostel.findOne({
    _id: hostelId,
    owner: ownerId, // CRITICAL: Ensures the vendor only manages their own hostels
  });

  if (!hostel) {
    throw new Error('Hostel not found or you do not have permission to modify it.');
  }
  
  // 2. Create the Room
  const newRoom = await Room.create({
    ...roomData,
    hostel: hostelId,
  });

  // 3. Optional: Initialize Availability (for demonstration, we create 30 days of availability)
  const capacity = newRoom.capacity;
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  const availabilityRecords = [];
  
  // Create availability for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Create the availability object
    availabilityRecords.push({
      room: newRoom._id,
      date: date,
      totalSlots: capacity,
      availableSlots: capacity,
    });
  }

  // Insert all initial availability records into the database
  await RoomAvailability.insertMany(availabilityRecords);

  return newRoom;
};

/**
 * Fetches all rooms for a specific hostel.
 * @param hostelId The ID of the parent hostel.
 * @returns A list of IRoom documents.
 */
const getRoomsByHostelId = async (hostelId: string): Promise<IRoom[]> => {
  const rooms = await Room.find({ hostel: hostelId });
  return rooms;
};


/**
 * Core function for checking room availability and price for a date range.
 * This function will be expanded heavily for search features later.
 * @param roomId The ID of the room being checked.
 * @param date The specific date to check (normalized to start of day).
 * @returns The availability record.
 */
const checkRoomAvailability = async (roomId: string, date: Date): Promise<IRoomAvailability | null> => {
    // Normalize date to start of day for accurate lookup against the index
    date.setHours(0, 0, 0, 0); 
    
    const availability = await RoomAvailability.findOne({
        room: roomId,
        date: date,
    });
    
    return availability;
}


// --- FUTURE ACTION: Logic for updating/adding new batches of availability will go here ---

export default {
  createRoomAndAvailability,
  getRoomsByHostelId,
  checkRoomAvailability,
};