import express from 'express';
import { loginUser } from '../controllers/login.js';
import { createUser } from '../controllers/usersController.js';

const router = express.Router();


router.get('/login', loginUser)
router.post('/signIn', createUser)


export default router;