import express from 'express';
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/usersController.js';

const router = express.Router();

// Routes
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

export default router;