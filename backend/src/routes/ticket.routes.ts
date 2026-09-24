import { Router } from 'express';
import {
  getTickets,
  getMyTickets,
  getAssignedTickets,
  getTicketById,
  createTicket,
  updateStatus,
  updatePriority,
  assignTicket,
  resolveTicket,
  escalateTicket,
  reopenTicket,
  addComment,
  addInternalNote,
} from '../controllers/ticket.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createTicketSchema,
  updateStatusSchema,
  updatePrioritySchema,
  assignTicketSchema,
  resolveTicketSchema,
  escalateTicketSchema,
  reopenTicketSchema,
  createCommentSchema,
  createInternalNoteSchema,
} from '../validators/index.js';

const router = Router();

// Base authentication required for all ticket operations
router.use(authenticateToken);

// 1. Specific queries
// Student's own tickets
router.get('/my', requireRole('STUDENT'), getMyTickets);

// Staff's assigned tickets
router.get('/assigned', requireRole('STAFF', 'MANAGER'), getAssignedTickets);

// General tickets query (Manager & Staff can view institution tickets)
router.get('/', requireRole('STAFF', 'MANAGER'), getTickets);

// 2. Ticket creation (Students only)
router.post('/', requireRole('STUDENT'), validateBody(createTicketSchema), createTicket);

// 3. Single ticket retrieval (Accessible by all roles; permissions & notes seclusion enforced inside controller)
router.get('/:id', getTicketById);

// 4. Status update
router.patch('/:id/status', requireRole('STAFF', 'MANAGER'), validateBody(updateStatusSchema), updateStatus);

// 5. Priority update
router.patch('/:id/priority', requireRole('STAFF', 'MANAGER'), validateBody(updatePrioritySchema), updatePriority);

// 6. Assignment & Reassignment (Manager only)
router.post('/:id/assign', requireRole('MANAGER'), validateBody(assignTicketSchema), assignTicket);
router.post('/:id/reassign', requireRole('MANAGER'), validateBody(assignTicketSchema), assignTicket);

// 7. Resolve ticket
router.post('/:id/resolve', requireRole('STAFF', 'MANAGER'), validateBody(resolveTicketSchema), resolveTicket);

// 8. Escalate ticket
router.post('/:id/escalate', requireRole('STAFF', 'MANAGER'), validateBody(escalateTicketSchema), escalateTicket);

// 9. Reopen ticket (Student only)
router.post('/:id/reopen', requireRole('STUDENT'), validateBody(reopenTicketSchema), reopenTicket);

// 10. Public Comments (All roles)
router.post('/:id/comments', validateBody(createCommentSchema), addComment);

// 11. Internal Staff Notes (Staff & Manager ONLY - Students strictly rejected)
router.post('/:id/internal-notes', requireRole('STAFF', 'MANAGER'), validateBody(createInternalNoteSchema), addInternalNote);

export default router;
