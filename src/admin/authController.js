import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient.js';
import { supabaseJwtSecret } from '../supabaseClient.js';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cek apakah email ada di database
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        // Verifikasi password dengan Argon2
        const match = await argon2.verify(data.password, password);  // Verifikasi password yang disimpan di DB
        if (!match) {
            return res.status(401).json({ error: 'Password salah' });
        }

        // Buat JWT token
        const token = jwt.sign(
            { id: data.id, email: data.email, role: data.role },
            supabaseJwtSecret,
            { expiresIn: '1h' }  // Token berlaku 1 jam
        );

        // Kirim token sebagai respons
        return res.status(200).json({
            message: 'Login berhasil',
            token: token,
        });
    } catch (error) {
        console.error('Error login:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
};

const logout = (req, res) => {
    // Menghapus token dari sisi klien (cookies atau penyimpanan lokal)
    res.clearCookie('auth_token');  // Jika menggunakan cookies untuk menyimpan token

    return res.status(200).json({ message: 'Logout berhasil' });
};

export default { login, logout };
