import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { createKomentar, getKomentar, deleteKomentar, getAllKomentar } from '../controllers/komentarController.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

const validateCreateKomentar = [
    body('config_id').notEmpty().withMessage('config_id is required'),
    body('description').notEmpty().withMessage('description is required'),
    handleValidationErrors,
];

const validateGetKomentar = [
    param('config_id').isNumeric().withMessage('config_id must be a number'),
    handleValidationErrors,
];

const validateDeleteKomentar = [
    param('id').isNumeric().withMessage('id must be a number'),
    handleValidationErrors,
];

router.post('/komentar', validateCreateKomentar, createKomentar);
router.get('/komentar/:config_id', validateGetKomentar, getKomentar);
router.delete('/komentar/:id', validateDeleteKomentar, deleteKomentar);
router.get('/komentar', getAllKomentar);

export default router;