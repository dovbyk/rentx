import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

// All routes here will be prefixed with /api/v1/auth

// Public endpoints
router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;