import express from 'express';
import roomController from '../controllers/room.controller';
import authMiddleware from '../core/middleware/authMiddleware';
import roleMiddleware from '../core/middleware/roleMiddleware';
import { UserRole } from '../types/roles';

// mergeParams is CRITICAL here to access the :hostelId parameter from the parent router
const router = express.Router({ mergeParams: true });

// GET /api/v1/hostels/:hostelId/rooms - Public route to list rooms in a hostel
router.get('/', roomController.getRoomsByHostel);

// POST /api/v1/hostels/:hostelId/rooms - Protected route for inventory creation
router.post(
  '/',
  authMiddleware.protect, 
  roleMiddleware.restrictTo([UserRole.VENDOR, UserRole.ADMIN]), 
  roomController.createRoom
);

export default router;