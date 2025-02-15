import express from 'express';
import BookmarkController from '../controllers/BookmarkController.js';
import { userAuthMiddleware } from '../middleware/userAuthMiddleware.js';

const router = express.Router();

// Semua route bookmark memerlukan autentikasi user
router.post('/bookmarks', userAuthMiddleware, BookmarkController.addBookmark);
router.get('/bookmarks', userAuthMiddleware, BookmarkController.getBookmarks);
router.delete('/bookmarks/:id', userAuthMiddleware, BookmarkController.removeBookmark);

export default router;
