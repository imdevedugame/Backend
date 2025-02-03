import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from './supabaseClient.js';  // Menggunakan Supabase client untuk verifikasi user
import { supabaseJwt } from './supabaseClient.js';  // Kunci JWT dari Supabase

const app = express();
app.use(express.json());

// Endpoint untuk login admin
app.post('/login', async (req, res) => {
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

        // Verifikasi password
        const match = await bcrypt.compare(password, data.password);  // Asumsi password disimpan dengan hashing
        if (!match) {
            return res.status(401).json({ error: 'Password salah' });
        }

        // Buat JWT token
        const token = jwt.sign(
            { id: data.id, email: data.email, role: data.role },
            supabaseJwt,
            { expiresIn: '1h' }  // Token berlaku 1 jam
        );

        // Kirim token sebagai respons
        return res.status(200).json({
            message: 'Login berhasil',
            token: token,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
});

// Start server
app.listen(5000, () => {
    console.log('Server berjalan di http://localhost:5000');
});
