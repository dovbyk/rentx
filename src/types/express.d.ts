import { Request } from 'express';
import { IUser } from '../models/User.model'; // Assuming IUser is defined in your User.model

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Optional user property to hold the authenticated user document
    }
  }
}