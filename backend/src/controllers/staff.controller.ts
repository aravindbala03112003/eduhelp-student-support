import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';
import { computeTicketSla } from '../services/sla.service.js';

export async function getStaffWorkload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Fetch all staff members
    const staffResult = await pool.query(
      `SELECT id, name, email, department, phone, avatar_url
       FROM users
       WHERE role = 'STAFF'
       ORDER BY name ASC`
    );

    // Fetch all tickets assigned to staff
    const ticketsResult = await pool.query(
      `SELECT id, assigned_to, status, priority, sla_due_at, created_at, resolved_at
       FROM tickets
       WHERE assigned_to IS NOT NULL`
    );

    // Group tickets by staff member
    const ticketsByStaff = new Map<string, any[]>();
    for (const t of ticketsResult.rows) {
      if (!ticketsByStaff.has(t.assigned_to)) {
        ticketsByStaff.set(t.assigned_to, []);
      }
      ticketsByStaff.get(t.assigned_to)!.push(t);
    }

    const workload = staffResult.rows.map((staff) => {
      const staffTickets = ticketsByStaff.get(staff.id) || [];

      let assignedCount = 0;
      let inProgressCount = 0;
      let waitingCount = 0;
      let overdueCount = 0;
      let resolvedCount = 0;

      for (const t of staffTickets) {
        if (['RESOLVED', 'CLOSED'].includes(t.status)) {
          resolvedCount++;
          continue;
        }

        if (t.status === 'ASSIGNED') assignedCount++;
        if (t.status === 'IN_PROGRESS') inProgressCount++;
        if (t.status === 'WAITING_FOR_STUDENT') waitingCount++;

        const sla = computeTicketSla(new Date(t.created_at), new Date(t.sla_due_at), t.status);
        if (sla.status === 'BREACHED') {
          overdueCount++;
        }
      }

      const totalOpen = assignedCount + inProgressCount + waitingCount;

      return {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        department: staff.department,
        phone: staff.phone,
        avatarUrl: staff.avatar_url,
        assigned: assignedCount,
        inProgress: inProgressCount,
        waiting: waitingCount,
        overdue: overdueCount,
        resolved: resolvedCount,
        totalOpen,
      };
    });

    res.json({
      success: true,
      data: workload,
    });
  } catch (error) {
    next(error);
  }
}
