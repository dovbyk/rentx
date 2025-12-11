import express from 'express';
import hostelController from '../controllers/hostel.controller';
import authMiddleware from '../core/middleware/authMiddleware';
import roleMiddleware from '../core/middleware/roleMiddleware';
import { UserRole } from '../types/roles';
import roomRouter from './room.routes'; 

const router = express.Router();

//Any request to /api/v1/hostels/:hostelId/rooms
router.use('/:hostelId/rooms', roomRouter); 


router.get('/', hostelController.getAllHostels);


// 1. Vendor/Admin Route: Create a new hostel application
router.post(
  '/',
  authMiddleware.protect, // Must be logged in
  roleMiddleware.restrictTo([UserRole.VENDOR, UserRole.ADMIN]), // Only Vendors and Admins can submit
  hostelController.createHostel
);

// 2. Admin Route: Approve/Reject a hostel application
router.patch(
  '/:id/approve',
  authMiddleware.protect, // Must be logged in
  roleMiddleware.restrictTo([UserRole.ADMIN]), // Only Admins can change approval status
  hostelController.approveHostel
);


export default router;