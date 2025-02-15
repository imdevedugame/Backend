import express from 'express';
import ConfigController from '../controllers/configController.js';
import { userAuthMiddleware } from '../middleware/userAuthMiddleware.js';

const router = express.Router();

// Endpoint untuk mengambil semua config (publik)
router.get('/configs', ConfigController.getAllConfigs);

// Endpoint untuk mengambil config berdasarkan ID (publik)
router.get('/configs/:id', ConfigController.getConfigById);

// Endpoint untuk membuat config baru (dilindungi userAuth)
router.post('/configs', userAuthMiddleware, ConfigController.createConfig);

// Endpoint untuk mengupdate config (hanya pemilik yang bisa)
router.put('/configs/:id', userAuthMiddleware, ConfigController.updateConfig);

// Endpoint untuk menghapus config (hanya pemilik yang bisa)
router.delete('/configs/:id', userAuthMiddleware, ConfigController.deleteConfig);

export default router;
