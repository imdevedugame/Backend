import { body, validationResult } from 'express-validator';
import multer from 'multer';
import argon2 from 'argon2';
import { supabase } from "../supabaseClient.js";


const upload = multer({
    limits: { fileSize: 1 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
});


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

// Handle file upload and retrieve public URL
const uploadAvatar = async(file) => {
    const { buffer, originalname } = file;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`avatars/${Date.now()}_${originalname}`, buffer);

    if (uploadError) throw uploadError;

    return `https://qckcobphtiuerzftgnot.supabase.co/storage/v1/object/public/avatars/${uploadData.path}`;
};


export const createUser = async(req, res) => {
    upload.single('avatar')(req, res, async(err) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }

        const { username, email, password } = req.body;
        let avatarUrl = null;

        try {
            if (req.file) {
                avatarUrl = await uploadAvatar(req.file);
            }

            const hashedPassword = await argon2.hash(password);

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    username,
                    email,
                    password: hashedPassword,
                    avatar: avatarUrl,
                    is_active: true,
                    created_at: new Date(),
                }, ])
                .single();

            if (error) throw error;

            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error creating user',
                error: error.message,
            });
        }
    });
};


export const updateUserById = async(req, res) => {
    upload.single('avatar')(req, res, async(err) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }

        const { id } = req.params;
        const { username, email, password, is_active } = req.body;
        let updatedFields = { username, email, is_active };

        try {
            if (req.file) {
                updatedFields.avatar = await uploadAvatar(req.file);
            }

            if (password) {
                updatedFields.password = await argon2.hash(password);
            }

            const { data, error } = await supabase
                .from('users')
                .update(updatedFields)
                .eq('id', id)
                .single();

            if (error) throw error;

            res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error updating user',
                error: error.message,
            });
        }
    });
};


export const getAllUsers = async(req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, is_active, created_at, avatar');

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving users',
            error: error.message,
        });
    }
};


export const getUserById = async(req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, is_active, created_at, avatar')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data,
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'User not found',
            error: error.message,
        });
    }
};


export const deleteUserById = async(req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully',
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user',
            error: error.message,
        });
    }
};
