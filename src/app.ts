import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import authRouter from './routes/auth.routes';

dotenv.config();

// Create the Express application instance
const app = express();

/**
 * Global Middleware Setup
 * These run for every request to the server.
 */

// 1. Security Middleware (Helmet)
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : 'YOUR_FRONTEND_URL',
    credentials: true, 
}));

// 3. HTTP Request Logging (Morgan)
app.use(morgan('dev'));

// 4. Body Parsers
// Parse incoming JSON and URL-encoded payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Cookie Parser
app.use(cookieParser());

/**
 * API Routes for Modules
 */

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'API is running smoothly for RentX.',
        environment: process.env.NODE_ENV
    });
});

// --- AUTHENTICATION ROUTES ---
// Register the Auth router under /api/v1/auth
app.use('/api/v1/auth', authRouter); 
// ----------------------------

// Placeholder for future routes (e.g., User/Hostel routes)
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/hostels', hostelRouter);


/**
 * Error Handling Middleware
 * These must be defined AFTER all routes.
 */

// 1. Catch 404 - Not Found Handler
// If a request reaches this point, no route matched, so it's a 404 error.
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    // Create a temporary error object
    const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any;
    err.statusCode = 404;
    err.status = 'fail';
    next(err); // Pass the error to the global error handler
});

// 2. Global Error Handler (located in core/middleware/errorHandler.ts in the future)
// Catches errors passed via next(err) or thrown errors and sends a standardized response.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Set default status and status code
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error (using console.error as per the current setup)
    console.error(`[ERROR] ${err.status} (${err.statusCode}):`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Stack:', err.stack);
    }
    
    // Send a standardized error response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // Only send detailed error info in development mode
        ...(process.env.NODE_ENV === 'development' && { 
            error: err, 
            stack: err.stack 
        }),
    });
});


export default app;