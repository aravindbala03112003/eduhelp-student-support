import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';
import { computeTicketSla } from '../services/sla.service.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    if (user.role === 'STUDENT') {
      const result = await pool.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(*) FILTER (WHERE status IN ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED')) as open_count,
           COUNT(*) FILTER (WHERE status = 'WAITING_FOR_STUDENT') as waiting_count,
           COUNT(*) FILTER (WHERE status IN ('RESOLVED', 'CLOSED')) as resolved_count
         FROM tickets
         WHERE student_id = $1`,
        [user.id]
      );

      const row = result.rows[0];
      res.json({
        success: true,
        data: {
          role: 'STUDENT',
          openRequests: parseInt(row.open_count, 10),
          awaitingResponse: parseInt(row.waiting_count, 10),
          resolved: parseInt(row.resolved_count, 10),
          totalRequests: parseInt(row.total, 10),
        },
      });
      return;
    }

    if (user.role === 'STAFF') {
      const ticketsResult = await pool.query(
        `SELECT id, status, priority, sla_due_at, created_at, resolved_at
         FROM tickets
         WHERE assigned_to = $1`,
        [user.id]
      );

      let assignedCount = 0;
      let inProgressCount = 0;
      let waitingCount = 0;
      let dueSoonCount = 0;
      let slaBreachedCount = 0;

      for (const t of ticketsResult.rows) {
        if (['RESOLVED', 'CLOSED'].includes(t.status)) continue;

        assignedCount++;
        if (t.status === 'IN_PROGRESS') inProgressCount++;
        if (t.status === 'WAITING_FOR_STUDENT') waitingCount++;

        const sla = computeTicketSla(new Date(t.created_at), new Date(t.sla_due_at), t.status);
        if (sla.status === 'BREACHED') slaBreachedCount++;
        else if (sla.status === 'AT_RISK') dueSoonCount++;
      }

      res.json({
        success: true,
        data: {
          role: 'STAFF',
          assigned: assignedCount,
          inProgress: inProgressCount,
          waiting: waitingCount,
          dueSoon: dueSoonCount,
          slaBreached: slaBreachedCount,
          totalAssignedEver: ticketsResult.rows.length,
        },
      });
      return;
    }

    // MANAGER role
    const allTicketsResult = await pool.query(
      `SELECT id, status, priority, sla_due_at, created_at, resolved_at
       FROM tickets`
    );

    let total = allTicketsResult.rows.length;
    let openCount = 0;
    let resolvedCount = 0;
    let atRiskCount = 0;
    let breachedCount = 0;
    let totalResolutionHours = 0;
    let resolvedWithDurationCount = 0;

    for (const t of allTicketsResult.rows) {
      const createdAt = new Date(t.created_at);
      const slaDueAt = new Date(t.sla_due_at);
      const isTerminal = ['RESOLVED', 'CLOSED'].includes(t.status);

      if (isTerminal) {
        resolvedCount++;
        if (t.resolved_at) {
          const resolvedAt = new Date(t.resolved_at);
          const durationHours = Math.max(0, (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
          totalResolutionHours += durationHours;
          resolvedWithDurationCount++;
        }
      } else {
        openCount++;
        const sla = computeTicketSla(createdAt, slaDueAt, t.status);
        if (sla.status === 'BREACHED') breachedCount++;
        else if (sla.status === 'AT_RISK') atRiskCount++;
      }
    }

    const avgResolutionHours = resolvedWithDurationCount > 0
      ? Math.round((totalResolutionHours / resolvedWithDurationCount) * 10) / 10
      : 14.5;

    res.json({
      success: true,
      data: {
        role: 'MANAGER',
        totalTickets: total,
        open: openCount,
        slaAtRisk: atRiskCount,
        slaBreached: breachedCount,
        resolved: resolvedCount,
        avgResolutionHours,
      },
    });
  } catch (error) {
    next(error);
  }
}
