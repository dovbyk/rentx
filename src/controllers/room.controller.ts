import { Request, Response, NextFunction } from 'express';
import roomService from '../services/room.service';

/**
 * Handler for POST /api/v1/hostels/:hostelId/rooms
 * Allows a Vendor to create a new room and its initial availability.
 */
export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get hostelId from URL params and user ID from the protected request
    const { hostelId } = req.params;
    if (!hostelId) {
      return res.status(400).json({ status: 'fail', message: 'hostelId is required' });
    }
    const ownerId = req.user!._id; // Guaranteed to exist by the 'protect' middleware
    
    // Call the service layer which handles owner authorization and availability initialization
    const newRoom = await roomService.createRoomAndAvailability(
        hostelId, 
        req.body, 
        ownerId
    );

    res.status(201).json({
      status: 'success',
      message: 'Room and initial 30 days of availability created successfully.',
      data: {
        room: newRoom,
      },
    });
  } catch (error) {
    const err = error as Error;
    // Custom error handling for authorization/not found issues
    if (err.message.includes('Hostel not found')) {
      return next({ message: err.message, statusCode: 404 });
    }
    next({ message: err.message, statusCode: 400 }); // General bad request/validation error
  }
};

/**
 * Handler for GET /api/v1/hostels/:hostelId/rooms
 * Allows any user to view all room types in a specific hostel.
 */
export const getRoomsByHostel = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { hostelId } = req.params;
    if (!hostelId) {
      return res.status(400).json({ status: 'fail', message: 'hostelId is required' });
    }
        
        const rooms = await roomService.getRoomsByHostelId(hostelId); 

        res.status(200).json({
            status: 'success',
            results: rooms.length,
            data: {
                rooms,
            },
        });
    } catch (error) {
        next(error);
    }
};


export default {
  createRoom,
  getRoomsByHostel,
};