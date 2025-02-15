import { body, validationResult } from 'express-validator';
import multer from 'multer';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { supabase } from "../supabaseClient.js";

import { supabaseJwtSecret } from '../supabaseClient.js';

// Konfigurasi multer untuk upload file (misalnya avatar)
const upload = multer({
  limits: { fileSize: 1 * 1024 * 1024 }, // maksimal 1 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Fungsi untuk mengupload avatar ke storage Supabase dan mendapatkan URL publik
const uploadAvatar = async (file) => {
  const { buffer, originalname } = file;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(`avatars/${Date.now()}_${originalname}`, buffer);

  if (uploadError) throw uploadError;

  return `https://qckcobphtiuerzftgnot.supabase.co/storage/v1/object/public/avatars/${uploadData.path}`;
};

/**
 * API Register User
 * Endpoint: POST /api/userauth/register
 *
 * Mengharapkan form-data dengan field:
 * - avatar (opsional): file image
 * - username, email, password: string
 */
export const registerUser = async (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username, email, dan password wajib diisi',
      });
    }
    
    let avatarUrl = null;
    try {
      if (req.file) {
        avatarUrl = await uploadAvatar(req.file);
      }
  
      const hashedPassword = await argon2.hash(password);
  
      // Gunakan opsi { returning: 'minimal' } agar tidak mengembalikan data
      const { error } = await supabase
        .from('users')
        .insert([{
          username,
          email,
          password: hashedPassword,
          avatar: avatarUrl,
          is_active: true,
          created_at: new Date(),
        }], { returning: 'minimal' });
  
      if (error) throw error;
  
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully'
      });
  
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        status: 'error',
        message: 'Error registering user',
        error: error.message,
      });
    }
  });
};
  
/**
 * API Login User
 * Endpoint: POST /api/userauth/login
 *
 * Mengharapkan JSON body:
 * - email: string
 * - password: string
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email dan password wajib diisi',
    });
  }
  
  try {
    // Cari user berdasarkan email dari tabel users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  
    if (error || !data) {
      return res.status(400).json({
        status: 'error',
        message: 'Email atau password tidak valid',
      });
    }
  
    // Verifikasi password menggunakan argon2
    const validPassword = await argon2.verify(data.password, password);
    if (!validPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email atau password tidak valid',
      });
    }
  
    // Buat token JWT (pastikan process.env.JWT_SECRET sudah diset)
    const token = jwt.sign(
      { id: data.id, email: data.email },
      supabaseJwtSecret,
      { expiresIn: '1h' }
    );
  
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging in',
      error: error.message,
    });
  }
};
/**
 * API Logout User
 * Endpoint: POST /api/userauth/logout
 *
 * Catatan: Karena menggunakan JWT secara stateless, logout biasanya dilakukan
 * dengan menghapus token di sisi client. Jika menggunakan cookies, kamu bisa menghapusnya di sini.
 */
export const logoutUser = async (req, res) => {
    // Jika menggunakan cookies, hapus cookies misalnya:
    // res.clearCookie("token");
    return res.status(200).json({
      status: 'success',
      message: 'User logged out successfully'
    });
  };