import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { UserRole } from '../types/roles';
import * as dotenv from 'dotenv';

dotenv.config();

// Helper function to set the JWT token as an HTTP-Only cookie and send the response
const createSendToken = (token: string, statusCode: number, res: Response, user: any) => {
    // Convert JWT_EXPIRY (e.g., '7d') to milliseconds
    const expiryDays = process.env.JWT_EXPIRY ? parseInt(process.env.JWT_EXPIRY, 10) : 7;
    const cookieOptions = {
        expires: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000), // days to ms
        httpOnly: true, // Crucial for security: prevents client-side JS from reading the token
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'lax' as const, // Protection against CSRF
    };

    res.cookie('jwt', token, cookieOptions);

    // Final clean-up (though handled by model's toJSON, repetition is safe here)
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

/**
 * Controller for registering a new user (Student or Vendor).
 * Public endpoint: POST /api/v1/auth/signup
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, passwordConfirm, phone, role } = req.body;

        // Basic input validation
        if (!name || !email || !password || !passwordConfirm || !phone) {
            return next({ message: 'Please provide name, email, password, phone, and password confirmation.', statusCode: 400 });
        }
        if (password !== passwordConfirm) {
            return next({ message: 'Password and confirmation do not match.', statusCode: 400 });
        }
        if (password.length < 8) {
            return next({ message: 'Password must be at least 8 characters long.', statusCode: 400 });
        }

        // Determine the role: enforce Student by default, allow Vendor if requested
        let assignedRole: UserRole = UserRole.STUDENT;
        if (role && role.toLowerCase() === UserRole.VENDOR) {
            assignedRole = UserRole.VENDOR;
        }
        // Note: Admin registration should only be possible via a protected Admin endpoint or direct DB insertion.

        const { user, token } = await authService.registerUser({
            name,
            email,
            password,
            phone,
            role: assignedRole,
        });

        createSendToken(token, 201, res, user);
    } catch (error) {
        const err = error as Error;
        // Check for MongoDB duplicate key error (code 11000) for unique fields like email
        if (err.message.includes('E11000')) {
             return next({ message: 'Email already registered.', statusCode: 400 });
        }
        next({ message: err.message, statusCode: 500 });
    }
};

/**
 * Controller for logging in an existing user.
 * Public endpoint: POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next({ message: 'Please provide email and password.', statusCode: 400 });
        }

        const { user, token } = await authService.loginUser(email, password);

        createSendToken(token, 200, res, user);
    } catch (error) {
        // Errors from loginUser service are typically "Incorrect email or password."
        const err = error as Error;
        next({ message: err.message, statusCode: 401 }); // 401 Unauthorized
    }
};

/**
 * Controller for logging out the current user.
 * Public/Protected endpoint: POST /api/v1/auth/logout
 */
export const logout = (req: Request, res: Response) => {
    // Overwrite the JWT cookie with a bogus value that expires almost immediately
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
        httpOnly: true,
    });
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export default {
    register,
    login,
    logout,
};