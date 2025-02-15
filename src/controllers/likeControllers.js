import { supabase } from "../supabaseClient.js";

class LikeController {
  /**
   * Toggle like/dislike untuk suatu config.
   * Jika user belum like, maka akan menambahkan like.
   * Jika sudah like, maka like tersebut akan dihapus.
   *
   * Endpoint: POST /config/:id/like
   */
  async toggleLike(req, res) {
    const { id: configId } = req.params;
    const userId = req.user ? req.user.id : req.body.user_id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID diperlukan." });
    }

    try {
      const { data: existingLike, error: selectError } = await supabase
        .from("likes")
        .select("*")
        .eq("config_id", configId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) throw deleteError;

        return res.status(200).json({
          success: true,
          message: "Like dihapus (Disliked)",
        });
      } else {
        const { data: newLike, error: insertError } = await supabase
          .from("likes")
          .insert([{ config_id: configId, user_id: userId }])
          .single();

        if (insertError) throw insertError;

        return res.status(201).json({
          success: true,
          message: "Config telah di-like (Liked)",
          data: newLike,
        });
      }
    } catch (error) {
      console.error("Error saat toggle like:", error);
      return res
        .status(500)
        .json({ success: false, message: error.message });
    }
  }

  /**
   * Mendapatkan daftar like untuk suatu config.
   *
   * Endpoint: GET /config/:id/likes
   */
  async getLikesByConfig(req, res) {
    const { id: configId } = req.params;

    try {
      const { data: likes, error } = await supabase
        .from("likes")
        .select("*")
        .eq("config_id", configId);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: likes,
        count: likes.length,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: error.message });
    }
  }
}

export default new LikeController();
