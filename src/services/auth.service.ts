import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User, { IUser } from '../models/User.model';
import * as dotenv from 'dotenv';

dotenv.config(); 


const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET as jwt.Secret;
const JWT_EXPIRY: jwt.SignOptions['expiresIn'] = process.env.JWT_EXPIRY as jwt.SignOptions['expiresIn'];

if (!JWT_SECRET || !JWT_EXPIRY) {
    throw new Error("FATAL: JWT_SECRET or JWT_EXPIRY is not defined in the environment.");
}

/**
 * Generates a JSON Web Token for a given user ID.
 * @param id The user's MongoDB ObjectId.
 * @returns The signed JWT string.
 */
const signToken = (id: Types.ObjectId): string => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRY, // e.g., '7d'
    });
};

/**
 * Core service logic for user registration (signup).
 */
const registerUser = async (userData: any): Promise<{ user: IUser, token: string }> => {
    // 1. Check if user already exists
    let user = await User.findOne({ email: userData.email });
    if (user) {
        // We throw a simple Error here; the controller will map it to a 400 response.
        throw new Error('User already exists with this email.');
    }

    // 2. Create the new user (password hashing is handled by the User.model.ts pre-save hook)
    user = await User.create(userData);

    // 3. Generate a JWT
    const token = signToken(user._id);

    return { user, token };
};

/**
 * Core service logic for user login.
 */
const loginUser = async (email: string, password: string): Promise<{ user: IUser, token: string }> => {
    // 1. Find the user, explicitly requesting the 'password' field
    // We need '+password' because we set 'select: false' in the model.
    const user = await User.findOne({ email }).select('+password');

    // 2. Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Incorrect email or password.');
    }

    // 3. Generate a JWT
    const token = signToken(user._id);

    // Remove password from the user object before returning (extra safety)
    user.password = undefined as any; 

    return { user, token };
};

export default {
    registerUser,
    loginUser,
    signToken,
};