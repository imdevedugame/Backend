import { supabase } from "../supabaseClient.js";
import multer from 'multer';
const upload = multer();

class ConfigController {
    async getAllConfigs(req, res) {
        try {
            const { data, error } = await supabase
                .from('config')
                .select('*');

            if (error) throw error;

            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getConfigById(req, res) {
        const { id } = req.params;

        try {
            const { data, error } = await supabase
                .from('config')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createConfig(req, res) {
        const { judul, description, like, github } = req.body;
        const image = req.file;

        // Validasi kolom wajib
        if (!judul || !description) {
            return res.status(400).json({
                success: false,
                message: 'Kolom judul dan description wajib diisi.'
            });
        }

        // Validasi link GitHub (opsional)
        if (github && !/^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+$/.test(github)) {
            return res.status(400).json({
                success: false,
                message: 'Link GitHub tidak valid.'
            });
        }

        try {
            let imageUrl = null;

            if (image) {
                const { data, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(`config/${Date.now()}_${image.originalname}`, image.buffer);

                console.log('Upload result:', data, uploadError);

                if (uploadError) throw uploadError;

                console.log('File Path:', data.path);

                const { publicURL, error: urlError } = supabase.storage
                    .from('images')
                    .getPublicUrl(data.path);

                if (urlError || !publicURL) {
                    const supabaseUrl = 'https://qckcobphtiuerzftgnot.supabase.co';
                    imageUrl = `${supabaseUrl}/storage/v1/object/public/images/${data.path}`;
                } else {
                    imageUrl = publicURL;
                }

                console.log('Final Public URL:', imageUrl);
            }

            const likeValue = like || 0;

            const { data, error } = await supabase
                .from('config')
                .insert([{ judul, description, image_url: imageUrl, like: likeValue, github }])
                .single();

            if (error) throw error;

            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateConfig(req, res) {
        const { id } = req.params;
        const { judul, description, like, github } = req.body;
        const image = req.file;

        try {
            let imageUrl = null;

            if (image) {
                const { data, error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(`config/${Date.now()}_${image.originalname}`, image.buffer);

                console.log('Upload result:', data, uploadError);

                if (uploadError) throw uploadError;

                const { publicURL, error: urlError } = supabase.storage
                    .from('images')
                    .getPublicUrl(data.path);

                if (urlError || !publicURL) {
                    const supabaseUrl = 'https://qckcobphtiuerzftgnot.supabase.co';
                    imageUrl = `${supabaseUrl}/storage/v1/object/public/images/${data.path}`;
                } else {
                    imageUrl = publicURL;
                }

                console.log('Final Public URL:', imageUrl);
            }

            const updateData = {
                judul,
                description,
                like,
                github,
            };

            if (imageUrl) {
                updateData.image_url = imageUrl;
            }

            const { data, error } = await supabase
                .from('config')
                .update(updateData)
                .eq('id', id)
                .single();

            if (error) throw error;

            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteConfig(req, res) {
        const { id } = req.params;

        try {
            const { data, error } = await supabase
                .from('config')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.status(200).json({ success: true, message: 'Config deleted successfully', data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new ConfigController();
