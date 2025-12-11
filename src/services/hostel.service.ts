import Hostel, { IHostel } from '../models/Hostel.model';
import { Types } from 'mongoose';

const createHostel = async (hostelData: any, ownerId: Types.ObjectId): Promise<IHostel> => {

    const newHostelData = {
    ...hostelData,
    owner: ownerId,
    isApproved: false, // Ensures it requires Admin review
  };

  // 2. Create the document in the database
  const hostel = await Hostel.create(newHostelData);
  
  return hostel;
};


const getHostelById = async (id: string): Promise<IHostel | null> => {
    // Note: We might add filtering here later (e.g., only return if isApproved: true)
    const hostel = await Hostel.findById(id).populate('owner', 'name email phone'); 
    return hostel;
};


const getAllHostels = async (): Promise<IHostel[]> => {
    // For now, return all, but later we will filter by isApproved: true
    const hostels = await Hostel.find().populate('owner', 'name email phone');
    return hostels;
};

// --- ADMIN / VENDOR SPECIFIC ACTIONS ---


const updateHostelApproval = async (id: string, isApproved: boolean): Promise<IHostel | null> => {
    const hostel = await Hostel.findByIdAndUpdate(
        id, 
        { isApproved }, 
        { new: true, runValidators: true }
    );
    return hostel;
};


export default {
  createHostel,
  getHostelById,
  getAllHostels,
  updateHostelApproval,
};