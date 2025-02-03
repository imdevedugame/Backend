import express from 'express';
import ConfigController from '../controllers/configController.js';
import multer from 'multer';
const router = express.Router();
const upload = multer();




router.get('/configs', ConfigController.getAllConfigs);
router.get('/configs/:id', ConfigController.getConfigById);
router.post('/configs', upload.single('image'), ConfigController.createConfig);
router.put('/configs/:id', upload.single('image'), ConfigController.updateConfig);
router.delete('/configs/:id', ConfigController.deleteConfig);

export default router;