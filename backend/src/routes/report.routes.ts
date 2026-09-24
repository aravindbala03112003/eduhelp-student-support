import { Router } from 'express';
import { getReportsAnalytics } from '../controllers/report.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Manager and Staff access for analytics
router.get('/analytics', authenticateToken, requireRole('MANAGER', 'STAFF'), getReportsAnalytics);

export default router;
