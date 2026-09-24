import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/index.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
