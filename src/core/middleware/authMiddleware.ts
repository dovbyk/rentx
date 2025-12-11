//Only logged in users can access certain route by verifying JWT token

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../../models/User.model';
import * as dotenv from 'dotenv';

dotenv.config();

// Asserting the JWT_SECRET type as we did in the service
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET as jwt.Secret;

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Get token from Authorization header (Bearer Token) or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        
        return next({ 
            message: 'You are not logged in! Please log in to get access.', 
            statusCode: 401 
        });
    }

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next({ 
                message: 'The user belonging to this token no longer exists.', 
                statusCode: 401 
            });
        }

        // 4. Attach the user object to the request for subsequent middleware/controllers
        req.user = currentUser;
        next();
    } catch (err) {
        // Handle common JWT errors (e.g., expired token, invalid signature)
        const error = err as Error;
        let message = 'Invalid token. Please log in again.';
        let statusCode = 401;

        if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token. Please log in again.';
        } else if (error.name === 'TokenExpiredError') {
            message = 'Your token has expired! Please log in again.';
        }

        next({ message, statusCode });
    }
};

export default { protect };