import { supabase } from "../supabaseClient.js";

class BookmarkController {
  // Tambahkan bookmark (simpan config favorit)
  async addBookmark(req, res) {
    const userId = req.user.id; // Data user diambil dari middleware userAuth
    const { config_id } = req.body;

    if (!config_id) {
      return res.status(400).json({ status: 'error', message: 'Config ID diperlukan' });
    }

    try {
      // Cek apakah bookmark sudah ada
      const { data: existingBookmark, error: selectError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('config_id', config_id)
        .single();

      if (existingBookmark) {
        return res.status(400).json({ status: 'error', message: 'Bookmark sudah ada' });
      }

      // Insert bookmark baru, gunakan returning minimal agar tidak mengembalikan data
      const { error } = await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, config_id }], { returning: 'minimal' });

      if (error) throw error;

      res.status(201).json({
        status: 'success',
        message: 'Bookmark berhasil ditambahkan'
      });
    } catch (error) {
      console.error("Add bookmark error:", error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Ambil semua bookmarks milik user
  async getBookmarks(req, res) {
    const userId = req.user.id;
    try {
      // Pilihan: Join dengan tabel configs untuk mendapatkan detail config
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          config_id,
          created_at,
          config: config ( * )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Hapus bookmark berdasarkan id
  async removeBookmark(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    try {
      // Pastikan bookmark yang akan dihapus milik user yang sedang login
      const { data: bookmark, error: selectError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (selectError) throw selectError;
      if (!bookmark) {
        return res.status(404).json({ status: 'error', message: 'Bookmark tidak ditemukan' });
      }

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ status: 'success', message: 'Bookmark berhasil dihapus' });
    } catch (error) {
      console.error("Remove bookmark error:", error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export default new BookmarkController();
