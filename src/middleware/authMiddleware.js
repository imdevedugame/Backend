import jwt from 'jsonwebtoken';
import { supabaseJwtSecret } from '../supabaseClient.js';  // Pastikan ini berisi kunci rahasia yang sesuai

const authAdmins = (req, res, next) => {
    // Mengambil token dari header 'Authorization'
    const token = req.headers['authorization']?.split(' ')[1]; 

    // Jika token tidak ada, kirimkan error 403
    if (!token) {
        return res.status(403).json({ error: 'Token JWT diperlukan' });
    }

    try {
        // Verifikasi token menggunakan kunci rahasia
        const decoded = jwt.verify(token, supabaseJwtSecret);
        
        // Simpan informasi pengguna yang sudah didekode ke dalam request
        req.user = decoded;

        // Lanjutkan ke middleware berikutnya atau handler route
        next();  
    } catch (err) {
        // Cek apakah token telah kedaluwarsa
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token telah kedaluwarsa' });
        }

        // Jika token tidak valid, kirimkan error 401
        return res.status(401).json({ error: 'Token tidak valid' });
    }
};

export default authAdmins;
