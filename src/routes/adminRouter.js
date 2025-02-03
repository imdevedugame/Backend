import express from "express";
import adminManagement from "../admin/adminManagement.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Import middleware

const router = express.Router();

// Gunakan middleware untuk semua route admins
router.post('/admin/protected-route', authMiddleware, (req, res) => {
    // Hanya admin yang bisa mengakses route ini
    res.status(200).json({ message: 'Akses diterima untuk admin!' });
});
router.get("/admins/:id", authMiddleware, adminManagement.getAdminById);
router.post("/admins", authMiddleware, adminManagement.createAdmin);
router.put("/admins/:id", authMiddleware, adminManagement.updateAdmin);
router.delete("/admins/:id", authMiddleware, adminManagement.deleteAdmin);

export default router;
