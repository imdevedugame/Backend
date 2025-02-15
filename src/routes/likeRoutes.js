import express from "express";
import LikeController from "../controllers/likeControllers.js";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware.js"; // Import middleware

const router = express.Router();

// Endpoint untuk toggle like, dilindungi oleh middleware autentikasi
router.post("/config/:id/like", userAuthMiddleware, LikeController.toggleLike);

// Endpoint untuk mendapatkan daftar like suatu config, juga dilindungi oleh middleware autentikasi
router.get("/config/:id/likes", userAuthMiddleware, LikeController.getLikesByConfig);

export default router;
