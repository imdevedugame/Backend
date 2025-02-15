import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/userAuthController.js';
import { userAuthMiddleware } from '../middleware/userAuthMiddleware.js';

const router = express.Router();

// Endpoint register user: POST /api/userauth/register (public)
router.post('/userauth/register', registerUser);

// Endpoint login user: POST /api/userauth/login (public)
router.post('/userauth/login', loginUser);
router.post('/userauth/logout', userAuthMiddleware, logoutUser);
// Contoh endpoint protected: GET /api/userauth/profile
// Endpoint ini hanya bisa diakses jika request mengirimkan token yang valid
router.get('/userauth/profile', userAuthMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Profile user berhasil diakses',
    user: req.user, // Data user yang didecode dari token
  });
});

export default router;
