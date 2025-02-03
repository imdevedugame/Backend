import { supabase } from "../supabaseClient.js";

export const createKomentar = async(req, res) => {
    const { config_id, description, parent_id, id_user } = req.body;

  
    if (!config_id || !description || !id_user) {
        return res.status(400).json({
            status: 'error',
            message: 'config_id, description, and id_user are required',
        });
    }

    try {
        const { data, error } = await supabase
            .from('komentar')
            .insert([{ config_id, description, parent_id, id_user }]);

        if (error) {
            throw error;
        }

        return res.status(201).json({
            status: 'success',
            message: 'Comment created successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error creating comment',
            error: error.message,
        });
    }
};
export const getKomentar = async(req, res) => {
    const { config_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('komentar')
            .select(`
                id,
                description,
                parent_id,
                id_user,
                created_at,
                user:users(username, avatar) // Relasi ke tabel users
            `)
            .eq('config_id', config_id);

        if (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching comments',
                error: error.message,
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No comments found',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Comments retrieved successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error retrieving comments',
            error: error.message,
        });
    }
};

export const deleteKomentar = async(req, res) => {
    const { id } = req.params;

    // Validasi input
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'id is required',
        });
    }

    try {
        const { data, error } = await supabase
            .from('komentar')
            .delete()
            .match({ id });

        if (error) {
            throw error;
        }

        return res.status(200).json({
            status: 'success',
            message: 'Comment deleted successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error deleting comment',
            error: error.message,
        });
    }
};

export const getAllKomentar = async(req, res) => {
    try {
        const { data, error } = await supabase
            .from('komentar')
            .select('*');

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No comments found',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'All comments retrieved successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error retrieving all comments',
            error: error.message,
        });
    }
};
