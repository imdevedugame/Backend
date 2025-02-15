import { supabase } from "../supabaseClient.js";
import multer from 'multer';

// Konfigurasi multer: 
// - Batas ukuran file per gambar: 800KB
// - Maksimal 5 file, dengan field name "images"
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 800 * 1024 }, // 800KB per file
});

// Fungsi untuk upload satu file dan mendapatkan URL publik
const uploadImage = async (file) => {
  const { buffer, originalname } = file;
  const { data, error: uploadError } = await supabase.storage
    .from('images')
    .upload(`config/${Date.now()}_${originalname}`, buffer);

  if (uploadError) throw uploadError;

  const { publicURL, error: urlError } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  if (urlError || !publicURL) {
    const supabaseUrl = 'https://qckcobphtiuerzftgnot.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/images/${data.path}`;
  } else {
    return publicURL;
  }
};

class ConfigController {
  // Mendapatkan semua config
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

  // Mendapatkan config berdasarkan ID
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

  // Membuat config baru dengan dukungan upload maksimal 5 gambar
  async createConfig(req, res) {
    // Gunakan multer untuk meng-handle array file dengan field "images"
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      // Ambil data dari req.body
      const {
        judul,
        description,
        like,
        github,
        desktop_environment,
        windows_manager,
        distro,
        terminal,
        shell,
        author
      } = req.body;

      // Validasi kolom wajib
      if (!judul || !description || !author) {
        return res.status(400).json({
          success: false,
          message: 'Kolom judul, deskripsi, dan author wajib diisi.'
        });
      }

      try {
        // Upload gambar jika ada (dijalankan secara paralel)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
          if (req.files.length > 5) {
            return res.status(400).json({
              success: false,
              message: 'Maksimal 5 gambar diperbolehkan.'
            });
          }
          imageUrls = await Promise.all(req.files.map(file => uploadImage(file)));
        }

        // Ambil user_id dari req.user (pastikan endpoint ini dilindungi middleware userAuth)
        const user_id = req.user.id;
        const likeValue = like || 0;

        // Insert config baru
        const { data, error } = await supabase
          .from('config')
          .insert([{
            judul,
            description,
            image_url: imageUrls,
            like: likeValue,
            github,
            desktop_environment,
            windows_manager,
            distro,
            terminal,
            shell,
            author,
            user_id,
            created_at: new Date(),
          }], { returning: 'representation' })
          .single();

        if (error) throw error;

        res.status(201).json({ success: true, data });
      } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }

  // Mengupdate config (hanya oleh user yang membuat config)
  async updateConfig(req, res) {
    const { id } = req.params;
    const {
      judul,
      description,
      like,
      github,
      desktop_environment,
      windows_manager,
      distro,
      terminal,
      shell,
      author
    } = req.body;

    try {
      // Cek dulu apakah config ini dimiliki oleh user yang sedang login
      const { data: existingConfig, error: fetchError } = await supabase
        .from('config')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingConfig) {
        return res.status(404).json({ success: false, message: 'Config tidak ditemukan.' });
      }
      if (existingConfig.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk mengedit config ini.' });
      }

      // Gunakan multer untuk file gambar (opsional update gambar)
      upload.array('images', 5)(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        let imageUrls = existingConfig.image_url || [];
        if (req.files && req.files.length > 0) {
          if (req.files.length > 5) {
            return res.status(400).json({
              success: false,
              message: 'Maksimal 5 gambar diperbolehkan.'
            });
          }
          // Upload tiap file secara paralel dan ganti imageUrls
          imageUrls = await Promise.all(req.files.map(file => uploadImage(file)));
        }

        const updateData = {
          judul,
          description,
          like,
          github,
          desktop_environment,
          windows_manager,
          distro,
          terminal,
          shell,
          author,
          image_url: imageUrls
        };

        const { data, error } = await supabase
          .from('config')
          .update(updateData)
          .eq('id', id)
          .single();

        if (error) throw error;

        res.status(200).json({ success: true, data });
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Menghapus config (hanya oleh user yang membuat config)
  async deleteConfig(req, res) {
    const { id } = req.params;

    try {
      // Cek dulu kepemilikan config
      const { data: existingConfig, error: fetchError } = await supabase
        .from('config')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingConfig) {
        return res.status(404).json({ success: false, message: 'Config tidak ditemukan.' });
      }
      if (existingConfig.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin untuk menghapus config ini.' });
      }

      const { data, error } = await supabase
        .from('config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'Config berhasil dihapus.', data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new ConfigController();
