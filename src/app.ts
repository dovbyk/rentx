import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import hostelRouter from './routes/hostel.routes';

dotenv.config();

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : 'YOUR_FRONTEND_URL',
    credentials: true, 
}));

app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());


// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'API is running smoothly for RentX.',
        environment: process.env.NODE_ENV
    });
});

//ROUTES 

app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/hostels', hostelRouter);

/**
 * Error Handling Middleware
 * These must be defined AFTER all routes.
 */

// If execution reaches this generic middleware, no routes matched.
app.use((req: Request, res: Response, next: NextFunction) => {
    // We no longer use app.all('*') which caused the path-to-regexp error.
    const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any;
    err.statusCode = 404;
    err.status = 'fail';
    next(err); // Pass the error to the global error handler
});

// 2. Global Error Handler
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