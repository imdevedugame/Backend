import jwt from 'jsonwebtoken';
import { supabaseJwtSecret } from '../supabaseClient.js';
export const userAuthMiddleware = (req, res, next) => {
  // Ambil token dari header Authorization dengan format "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak ditemukan atau format salah',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verifikasi token menggunakan secret key yang sudah diset di environment variable
    const decoded = jwt.verify(token, supabaseJwtSecret);
    // Simpan data user yang sudah didecode ke dalam req.user
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid atau sudah kedaluwarsa',
      error: error.message,
    });
  }
};
