import * as dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/mongo';
import app from './app'; 
import { Server } from 'http'; // For type safety

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

connectDB();

let server: Server;

server = app.listen(PORT, () => {
  console.log(`[INFO] Server running in ${NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
