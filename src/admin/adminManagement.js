import { supabase } from "../supabaseClient.js";
import argon2 from "argon2";

async function hashedPassword(password) {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 2,
        });
    } catch (error) {
        console.error("Error saat hashing password:", error);
        throw error;
    }
}

export class AdminManagement {
    // Ambil semua admin
    async getAllAdmins(req, res) {
        try {
            const { data: admins, error } = await supabase
                .from("admins")
                .select("id, username, email, is_active, created_at, updated_at");

            if (error) throw error;

            res.json(admins);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Ambil satu admin berdasarkan ID
    async getAdminById(req, res) {
        const { id } = req.params;
        try {
            const { data, error } = await supabase
                .from("admins")
                .select("id, username, email, is_active, created_at, updated_at")
                .eq("id", id)
                .single();

            if (!data) return res.status(404).json({ message: "Admin tidak ditemukan" });

            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Buat admin baru
    async createAdmin(req, res) {
        const { username, email, password } = req.body;

        try {
            const hashedPass = await hashedPassword(password);

            const { data, error } = await supabase
                .from("admins")
                .insert([{ username, email, password: hashedPass }])
                .select("id, username, email, is_active, created_at, updated_at ,role");

            if (error) throw error;

            res.status(201).json({ message: "Admin berhasil dibuat", data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update admin berdasarkan ID
    async updateAdmin(req, res) {
        const { id } = req.params;
        const { username, email, password, is_active } = req.body;

        try {
            let updateData = { username, email, is_active, updated_at: new Date() };

            // Jika password diubah, hash ulang
            if (password) {
                updateData.password = await hashedPassword(password);
            }

            const { data, error } = await supabase
                .from("admins")
                .update(updateData)
                .eq("id", id)
                .select("id, username, email, is_active, created_at, updated_at");

            if (!data) return res.status(404).json({ message: "Admin tidak ditemukan" });

            res.status(200).json({ message: "Admin berhasil diperbarui", data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Hapus admin berdasarkan ID
    async deleteAdmin(req, res) {
        const { id } = req.params;
        try {
            const { data, error } = await supabase
                .from("admins")
                .delete()
                .eq("id", id)
                .select();

            if (!data) return res.status(404).json({ message: "Admin tidak ditemukan" });

            res.status(200).json({ message: "Admin berhasil dihapus" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new AdminManagement();
