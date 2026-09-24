import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';
import { generateTicketNumber } from '../services/ticketNumber.service.js';
import { calculateSlaDueDate, computeTicketSla, computeTicketAge, Priority } from '../services/sla.service.js';
import { validateStatusTransition, TicketStatus, UserRole } from '../services/lifecycle.service.js';
import { logTicketHistory, createNotification } from '../services/history.service.js';

// Helper to decorate ticket with computed dynamic SLA and Age
export function enrichTicketWithSlaAndAge(ticket: any) {
  const createdAt = new Date(ticket.created_at);
  const slaDueAt = new Date(ticket.sla_due_at);
  const resolvedAt = ticket.resolved_at ? new Date(ticket.resolved_at) : null;

  const sla = computeTicketSla(createdAt, slaDueAt, ticket.status, resolvedAt);
  const age = computeTicketAge(createdAt);

  return {
    ...ticket,
    slaStatus: sla.status,
    slaBreached: sla.slaBreached,
    slaRemainingFormatted: sla.timeRemainingFormatted,
    slaPercentRemaining: sla.percentRemaining,
    slaIsAtRisk: sla.isAtRisk,
    ageFormatted: age.ageFormatted,
    ageBracket: age.ageBracket,
    ageHours: age.ageHours,
  };
}

export async function getTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      status,
      priority,
      category_id,
      assigned_to,
      sla_status,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by student if student is requesting (defense-in-depth)
    if (req.user?.role === 'STUDENT') {
      conditions.push(`t.student_id = $${paramIndex++}`);
      params.push(req.user.id);
    }

    if (status) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }

    if (priority) {
      conditions.push(`t.priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (category_id) {
      conditions.push(`t.category_id = $${paramIndex++}`);
      params.push(parseInt(category_id as string, 10));
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        conditions.push(`t.assigned_to IS NULL`);
      } else {
        conditions.push(`t.assigned_to = $${paramIndex++}`);
        params.push(assigned_to);
      }
    }

    if (search) {
      conditions.push(`(
        t.ticket_number ILIKE $${paramIndex} OR
        t.subject ILIKE $${paramIndex} OR
        t.description ILIKE $${paramIndex} OR
        u.name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const validSortCols: Record<string, string> = {
      created_at: 't.created_at',
      updated_at: 't.updated_at',
      sla_due_at: 't.sla_due_at',
      priority: 't.priority',
      status: 't.status',
    };
    const sortCol = validSortCols[sort_by as string] || 't.created_at';
    const sortDir = (sort_order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM tickets t
      JOIN users u ON t.student_id = u.id
      ${whereClause}
    `;
    const countResult = await pool.query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Data query
    const dataSql = `
      SELECT 
        t.id, t.ticket_number, t.student_id, t.category_id, t.subject, t.description,
        t.priority, t.status, t.assigned_to, t.sla_due_at, t.sla_breached,
        t.resolved_at, t.closed_at, t.resolution_notes, t.created_at, t.updated_at,
        u.name as student_name, u.email as student_email, u.department as student_dept,
        c.name as category_name, c.code as category_code,
        staff.name as assigned_to_name, staff.email as assigned_to_email
      FROM tickets t
      JOIN users u ON t.student_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN users staff ON t.assigned_to = staff.id
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataResult = await pool.query(dataSql, [...params, limitNum, offset]);
    let tickets = dataResult.rows.map(enrichTicketWithSlaAndAge);

    // Apply SLA status filter in memory if specified
    if (sla_status) {
      tickets = tickets.filter((t) => t.slaStatus === sla_status);
    }

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user?.id;
    const { status, search } = req.query;

    const conditions: string[] = ['t.student_id = $1'];
    const params: any[] = [studentId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(t.ticket_number ILIKE $${paramIndex} OR t.subject ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const sql = `
      SELECT 
        t.id, t.ticket_number, t.student_id, t.category_id, t.subject, t.description,
        t.priority, t.status, t.assigned_to, t.sla_due_at, t.sla_breached,
        t.resolved_at, t.closed_at, t.resolution_notes, t.created_at, t.updated_at,
        c.name as category_name, c.code as category_code,
        staff.name as assigned_to_name
      FROM tickets t
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN users staff ON t.assigned_to = staff.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(sql, params);
    const tickets = result.rows.map(enrichTicketWithSlaAndAge);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignedTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const staffId = req.user?.id;
    const { status, priority, search } = req.query;

    const conditions: string[] = ['t.assigned_to = $1'];
    const params: any[] = [staffId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }

    if (priority) {
      conditions.push(`t.priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (search) {
      conditions.push(`(t.ticket_number ILIKE $${paramIndex} OR t.subject ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const sql = `
      SELECT 
        t.id, t.ticket_number, t.student_id, t.category_id, t.subject, t.description,
        t.priority, t.status, t.assigned_to, t.sla_due_at, t.sla_breached,
        t.resolved_at, t.closed_at, t.resolution_notes, t.created_at, t.updated_at,
        u.name as student_name, u.email as student_email, u.department as student_dept,
        c.name as category_name, c.code as category_code
      FROM tickets t
      JOIN users u ON t.student_id = u.id
      JOIN categories c ON t.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(sql, params);
    const tickets = result.rows.map(enrichTicketWithSlaAndAge);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    // Fetch Ticket
    const ticketSql = `
      SELECT 
        t.id, t.ticket_number, t.student_id, t.category_id, t.subject, t.description,
        t.priority, t.status, t.assigned_to, t.sla_due_at, t.sla_breached,
        t.resolved_at, t.closed_at, t.resolution_notes, t.created_at, t.updated_at,
        u.name as student_name, u.email as student_email, u.department as student_dept, u.phone as student_phone,
        c.name as category_name, c.code as category_code,
        staff.name as assigned_to_name, staff.email as assigned_to_email, staff.department as assigned_to_dept
      FROM tickets t
      JOIN users u ON t.student_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN users staff ON t.assigned_to = staff.id
      WHERE t.id = $1
    `;

    const ticketResult = await pool.query(ticketSql, [id]);
    if (ticketResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticketRaw = ticketResult.rows[0];

    // Authorization Check: Student must be owner
    if (user.role === 'STUDENT' && ticketRaw.student_id !== user.id) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ticket.',
      });
      return;
    }

    // Fetch Comments:
    // CRITICAL SECURITY RULE: If user is STUDENT, query only public comments (is_internal = FALSE)
    const isStudent = user.role === 'STUDENT';
    const commentsSql = `
      SELECT 
        c.id, c.ticket_id, c.user_id, c.comment, c.is_internal, c.created_at,
        u.name as author_name, u.role as author_role, u.avatar_url as author_avatar
      FROM ticket_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = $1 ${isStudent ? 'AND c.is_internal = FALSE' : ''}
      ORDER BY c.created_at ASC
    `;
    const commentsResult = await pool.query(commentsSql, [id]);

    // Fetch History Audit Trail
    const historySql = `
      SELECT 
        h.id, h.ticket_id, h.user_id, h.action, h.old_value, h.new_value, h.created_at,
        u.name as actor_name, u.role as actor_role
      FROM ticket_history h
      JOIN users u ON h.user_id = u.id
      WHERE h.ticket_id = $1
      ORDER BY h.created_at ASC
    `;
    const historyResult = await pool.query(historySql, [id]);

    // Fetch Attachments
    const attachmentsSql = `
      SELECT a.id, a.ticket_id, a.uploaded_by, a.file_name, a.file_url, a.file_type, a.file_size, a.created_at,
             u.name as uploaded_by_name
      FROM attachments a
      JOIN users u ON a.uploaded_by = u.id
      WHERE a.ticket_id = $1
      ORDER BY a.created_at ASC
    `;
    const attachmentsResult = await pool.query(attachmentsSql, [id]);

    const enrichedTicket = enrichTicketWithSlaAndAge(ticketRaw);

    res.json({
      success: true,
      data: {
        ...enrichedTicket,
        comments: commentsResult.rows,
        history: historyResult.rows,
        attachments: attachmentsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.id;
    const { category_id, subject, description, priority } = req.body;

    // Check category validity
    const catCheck = await pool.query(`SELECT id, default_sla_hours FROM categories WHERE id = $1 AND is_active = TRUE`, [category_id]);
    if (catCheck.rows.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or inactive category selected.' });
      return;
    }

    const ticketNumber = await generateTicketNumber();
    const slaDueAt = calculateSlaDueDate(priority as Priority);

    const insertSql = `
      INSERT INTO tickets (
        ticket_number, student_id, category_id, subject, description,
        priority, status, sla_due_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'NEW', $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertSql, [
      ticketNumber,
      studentId,
      category_id,
      subject,
      description,
      priority,
      slaDueAt,
    ]);

    const createdTicket = result.rows[0];

    // Log Creation History
    await logTicketHistory(
      createdTicket.id,
      studentId,
      'TICKET_CREATED',
      null,
      `Status: NEW, Priority: ${priority}`
    );

    // Notify Student
    await createNotification(
      studentId,
      `Request Submitted: ${ticketNumber}`,
      `Your request regarding "${subject}" has been successfully logged.`,
      createdTicket.id
    );

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully.',
      data: enrichTicketWithSlaAndAge(createdTicket),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status: nextStatus, resolution_notes } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, status, student_id, ticket_number, assigned_to FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];
    const currentStatus = ticket.status as TicketStatus;

    // Validate lifecycle transition
    const isOwner = user.role === 'STUDENT' && ticket.student_id === user.id;
    const validation = validateStatusTransition(currentStatus, nextStatus as TicketStatus, user.role as UserRole, isOwner);

    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.reason });
      return;
    }

    let updateSql = `UPDATE tickets SET status = $1, updated_at = NOW()`;
    const params: any[] = [nextStatus];
    let paramIndex = 2;

    if (nextStatus === 'RESOLVED') {
      updateSql += `, resolved_at = NOW(), resolution_notes = $${paramIndex++}`;
      params.push(resolution_notes || 'Resolved by support staff');
    } else if (nextStatus === 'CLOSED') {
      updateSql += `, closed_at = NOW()`;
    }

    updateSql += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const updatedRes = await pool.query(updateSql, params);
    const updatedTicket = updatedRes.rows[0];

    // Log history
    await logTicketHistory(
      id,
      user.id,
      'STATUS_CHANGED',
      currentStatus,
      nextStatus
    );

    // Notify Student
    await createNotification(
      ticket.student_id,
      `Ticket Status Updated: ${ticket.ticket_number}`,
      `Your request status has been updated to "${nextStatus}".`,
      id
    );

    res.json({
      success: true,
      message: `Status updated to ${nextStatus}`,
      data: enrichTicketWithSlaAndAge(updatedTicket),
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePriority(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { priority } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, priority, created_at, ticket_number FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];
    const oldPriority = ticket.priority;

    if (oldPriority === priority) {
      res.json({ success: true, message: 'Priority is already set to this level.' });
      return;
    }

    // Recompute SLA due at based on creation time and new priority
    const newSlaDueAt = calculateSlaDueDate(priority as Priority, new Date(ticket.created_at));

    const updateSql = `
      UPDATE tickets 
      SET priority = $1, sla_due_at = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(updateSql, [priority, newSlaDueAt, id]);

    // Log history
    await logTicketHistory(id, user.id, 'PRIORITY_CHANGED', oldPriority, priority);

    res.json({
      success: true,
      message: `Priority changed from ${oldPriority} to ${priority}`,
      data: enrichTicketWithSlaAndAge(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

export async function assignTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { assigned_to } = req.body;
    const user = req.user!;

    // Check staff member
    const staffCheck = await pool.query(`SELECT id, name FROM users WHERE id = $1 AND role = 'STAFF'`, [assigned_to]);
    if (staffCheck.rows.length === 0) {
      res.status(400).json({ success: false, message: 'Selected user is not a valid support staff member.' });
      return;
    }
    const staffName = staffCheck.rows[0].name;

    const currentTicketRes = await pool.query(`
      SELECT t.id, t.status, t.assigned_to, t.ticket_number, t.student_id, staff.name as old_staff_name
      FROM tickets t
      LEFT JOIN users staff ON t.assigned_to = staff.id
      WHERE t.id = $1
    `, [id]);

    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];
    const oldStaffName = ticket.old_staff_name || 'UNASSIGNED';

    // Auto-transition NEW to ASSIGNED upon assignment
    const nextStatus = ticket.status === 'NEW' ? 'ASSIGNED' : ticket.status;

    const updateSql = `
      UPDATE tickets 
      SET assigned_to = $1, status = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(updateSql, [assigned_to, nextStatus, id]);

    // Log history
    const action = ticket.assigned_to ? 'TICKET_REASSIGNED' : 'TICKET_ASSIGNED';
    await logTicketHistory(id, user.id, action, oldStaffName, staffName);

    // Notify assigned staff
    await createNotification(
      assigned_to,
      `New Ticket Assigned: ${ticket.ticket_number}`,
      `You have been assigned to handle ticket ${ticket.ticket_number}.`,
      id
    );

    // Notify student
    await createNotification(
      ticket.student_id,
      `Ticket Assigned: ${ticket.ticket_number}`,
      `Your ticket has been assigned to ${staffName}.`,
      id
    );

    res.json({
      success: true,
      message: `Ticket successfully assigned to ${staffName}`,
      data: enrichTicketWithSlaAndAge(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { resolution_notes } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, status, student_id, ticket_number FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];
    const validation = validateStatusTransition(ticket.status as TicketStatus, 'RESOLVED', user.role as UserRole);

    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.reason });
      return;
    }

    const updateSql = `
      UPDATE tickets 
      SET status = 'RESOLVED', resolved_at = NOW(), resolution_notes = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(updateSql, [resolution_notes, id]);

    // Add public resolution comment
    await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
       VALUES ($1, $2, $3, FALSE, NOW())`,
      [id, user.id, `Ticket resolved: ${resolution_notes}`]
    );

    // Log history
    await logTicketHistory(id, user.id, 'TICKET_RESOLVED', ticket.status, 'RESOLVED');

    // Notify student
    await createNotification(
      ticket.student_id,
      `Ticket Resolved: ${ticket.ticket_number}`,
      `Your request has been resolved. You can view the resolution notes or reopen if the issue persists.`,
      id
    );

    res.json({
      success: true,
      message: 'Ticket has been marked as resolved.',
      data: enrichTicketWithSlaAndAge(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

export async function escalateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, status, student_id, ticket_number, assigned_to FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];
    const validation = validateStatusTransition(ticket.status as TicketStatus, 'ESCALATED', user.role as UserRole);

    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.reason });
      return;
    }

    const updateSql = `
      UPDATE tickets 
      SET status = 'ESCALATED', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateSql, [id]);

    // Add internal note with escalation reason if provided
    if (reason) {
      await pool.query(
        `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
         VALUES ($1, $2, $3, TRUE, NOW())`,
        [id, user.id, `Escalation Reason: ${reason}`]
      );
    }

    // Log history
    await logTicketHistory(id, user.id, 'TICKET_ESCALATED', ticket.status, 'ESCALATED');

    // Notify student that request has been escalated
    await createNotification(
      ticket.student_id,
      `Request Escalated: ${ticket.ticket_number}`,
      `Your request has been prioritized and escalated to senior institutional administration.`,
      id
    );

    res.json({
      success: true,
      message: 'Ticket has been escalated.',
      data: enrichTicketWithSlaAndAge(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

export async function reopenTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, status, student_id, ticket_number, assigned_to FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];

    // Must be student owner
    if (user.role === 'STUDENT' && ticket.student_id !== user.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to reopen this ticket.' });
      return;
    }

    const validation = validateStatusTransition(ticket.status as TicketStatus, 'REOPENED', user.role as UserRole, true);
    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.reason });
      return;
    }

    const updateSql = `
      UPDATE tickets 
      SET status = 'REOPENED', resolved_at = NULL, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateSql, [id]);

    // Add public comment explaining why reopened
    await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
       VALUES ($1, $2, $3, FALSE, NOW())`,
      [id, user.id, `Ticket reopened by student: ${reason}`]
    );

    // Log history
    await logTicketHistory(id, user.id, 'TICKET_REOPENED', ticket.status, 'REOPENED');

    // Notify assigned staff
    if (ticket.assigned_to) {
      await createNotification(
        ticket.assigned_to,
        `Ticket Reopened: ${ticket.ticket_number}`,
        `Student has reopened ticket ${ticket.ticket_number} with reason: "${reason}".`,
        id
      );
    }

    res.json({
      success: true,
      message: 'Ticket has been reopened.',
      data: enrichTicketWithSlaAndAge(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { comment } = req.body;
    const user = req.user!;

    const currentTicketRes = await pool.query(`SELECT id, status, student_id, ticket_number, assigned_to FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const ticket = currentTicketRes.rows[0];

    // Authorization: student can only comment on own ticket
    if (user.role === 'STUDENT' && ticket.student_id !== user.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to comment on this ticket.' });
      return;
    }

    // Insert public comment
    const commentRes = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
       VALUES ($1, $2, $3, FALSE, NOW())
       RETURNING *`,
      [id, user.id, comment]
    );

    // SPECIAL LIFECYCLE RULE:
    // If ticket was WAITING_FOR_STUDENT and student replies, auto-transition to IN_PROGRESS
    if (user.role === 'STUDENT' && ticket.status === 'WAITING_FOR_STUDENT') {
      await pool.query(`UPDATE tickets SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = $1`, [id]);
      await logTicketHistory(id, user.id, 'STATUS_CHANGED', 'WAITING_FOR_STUDENT', 'IN_PROGRESS');

      if (ticket.assigned_to) {
        await createNotification(
          ticket.assigned_to,
          `Student Responded: ${ticket.ticket_number}`,
          `Student has replied to ticket ${ticket.ticket_number}. Ticket is now IN_PROGRESS.`,
          id
        );
      }
    } else {
      // Regular notification to counterpart
      const recipientId = user.role === 'STUDENT' ? ticket.assigned_to : ticket.student_id;
      if (recipientId) {
        await createNotification(
          recipientId,
          `New Comment on ${ticket.ticket_number}`,
          `${user.name} added a comment: "${comment.slice(0, 80)}${comment.length > 80 ? '...' : ''}"`,
          id
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: {
        ...commentRes.rows[0],
        author_name: user.name,
        author_role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addInternalNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { comment } = req.body;
    const user = req.user!;

    // STRICT CHECK: Student must never be allowed to add internal notes
    if (user.role === 'STUDENT') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Students are not permitted to add internal staff notes.',
      });
      return;
    }

    const currentTicketRes = await pool.query(`SELECT id, ticket_number, assigned_to FROM tickets WHERE id = $1`, [id]);
    if (currentTicketRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Ticket not found.' });
      return;
    }

    const commentRes = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
       VALUES ($1, $2, $3, TRUE, NOW())
       RETURNING *`,
      [id, user.id, comment]
    );

    await logTicketHistory(id, user.id, 'INTERNAL_NOTE_ADDED', null, 'Internal note recorded');

    res.status(201).json({
      success: true,
      message: 'Internal note saved securely.',
      data: {
        ...commentRes.rows[0],
        author_name: user.name,
        author_role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}
