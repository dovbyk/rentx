import { Request, Response, NextFunction } from 'express';
import hostelService from '../services/hostel.service';
import { UserRole } from '../types/roles';

/**
 * Handler for POST /api/v1/hostels
 * Allows a Vendor to submit a new hostel application.
 */
export const createHostel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. The user must be authenticated (checked by authMiddleware)
    // 2. The user must be a VENDOR or ADMIN (checked by roleMiddleware)
    
    // req.user is guaranteed to exist here due to the 'protect' middleware running first
    const ownerId = req.user!._id; 
    
    // We pass the entire request body to the service for creation
    const hostel = await hostelService.createHostel(req.body, ownerId);

    res.status(201).json({
      status: 'success',
      data: {
        hostel,
      },
    });
  } catch (error) {
    const err = error as Error;
    next({ message: err.message, statusCode: 400 }); // 400 Bad Request for validation errors
  }
};

/**
 * Handler for GET /api/v1/hostels (Public/Student view)
 * Returns a list of all APPROVED hostels.
 */
export const getAllHostels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // NOTE: In the service, we must filter this list to only include isApproved: true
        const hostels = await hostelService.getAllHostels(); 

        res.status(200).json({
            status: 'success',
            results: hostels.length,
            data: {
                hostels,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handler for PATCH /api/v1/hostels/:id/approve (Admin-Only)
 * Updates the isApproved status.
 */
export const approveHostel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Only Admins can reach this controller due to restrictTo(['admin'])
        const { id } = req.params;
        const { isApproved } = req.body;
        
        // Basic validation for the approval status
        if (typeof isApproved !== 'boolean') {
            return next({ message: 'isApproved must be a boolean value.', statusCode: 400 });
        }

        const hostel = await hostelService.updateHostelApproval(id, isApproved);

        if (!hostel) {
            return next({ message: 'No hostel found with that ID.', statusCode: 404 });
        }

        res.status(200).json({
            status: 'success',
            message: `Hostel ${hostel.name} approval status updated to ${isApproved}`,
            data: { hostel },
        });

    } catch (error) {
        next(error);
    }
};


export default {
  createHostel,
  getAllHostels,
  approveHostel,
};