import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

//Global Middleware Setup: They run for every request to the server

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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Cookie Parser
app.use(cookieParser());

// APi routes for modules


// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'API is running smoothly for RentX.',
        environment: process.env.NODE_ENV
    });
});

export default app;
