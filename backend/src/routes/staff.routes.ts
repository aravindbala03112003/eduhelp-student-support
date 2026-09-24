import { Router } from 'express';
import { getStaffWorkload } from '../controllers/staff.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Staff workload is visible to Manager and Staff
router.get('/workload', authenticateToken, requireRole('MANAGER', 'STAFF'), getStaffWorkload);

export default router;
