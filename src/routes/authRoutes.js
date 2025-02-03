import express from 'express';
import authController from '../admin/authController.js';  // Import controller login dan logout

const router = express.Router();

// API login
router.post('/login', authController.login);

// API logout
router.post('/logout', authController.logout);

export default router;
