import { Router } from 'express';
import { getCategories } from '../controllers/category.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Categories are accessible by all authenticated users
router.get('/', authenticateToken, getCategories);

export default router;
