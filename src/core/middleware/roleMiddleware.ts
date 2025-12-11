//Restrict api calls to certain user roles only..

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../types/roles'; // Import your UserRole enum

/**
 * Middleware factory to restrict access based on user role.
 * @param allowedRoles An array of roles (e.g., [UserRole.VENDOR, UserRole.ADMIN])
 * @returns An Express middleware function
 */
export const restrictTo = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if req.user exists (Auth Middleware must run before this)
    if (!req.user) {
        return next({ 
            message: 'Authorization error: User not authenticated.', 
            statusCode: 401 
        });
    }

    // 2. Check if the user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      // If the user's role is not allowed, send a 403 Forbidden error
      return next({
        message: 'You do not have permission to perform this action.',
        statusCode: 403,
      });
    }

    // 3. If authorized, proceed to the next middleware or controller
    next();
  };
};

export default { restrictTo };