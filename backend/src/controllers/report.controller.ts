import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';
import { computeTicketSla, computeTicketAge } from '../services/sla.service.js';

export async function getReportsAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. By Category
    const categoryResult = await pool.query(
      `SELECT c.name, c.code, COUNT(t.id) as count
       FROM categories c
       LEFT JOIN tickets t ON c.id = t.category_id
       GROUP BY c.id, c.name, c.code
       ORDER BY count DESC`
    );

    // 2. By Priority
    const priorityResult = await pool.query(
      `SELECT priority, COUNT(*) as count
       FROM tickets
       GROUP BY priority`
    );

    // 3. By Status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM tickets
       GROUP BY status`
    );

    // 4. Volume over time (last 14 days grouped by day)
    const volumeResult = await pool.query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM-DD') as date,
         COUNT(*) as created_count,
         COUNT(*) FILTER (WHERE status IN ('RESOLVED', 'CLOSED')) as resolved_count
       FROM tickets
       WHERE created_at >= NOW() - INTERVAL '14 days'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
       ORDER BY date ASC`
    );

    // 5. Fetch all tickets for exact SLA & Ageing distributions
    const allTickets = await pool.query(
      `SELECT id, status, priority, created_at, sla_due_at, resolved_at FROM tickets`
    );

    let onTrackCount = 0;
    let atRiskCount = 0;
    let breachedCount = 0;
    let resolvedWithinSla = 0;
    let resolvedBreached = 0;

    const ageingCounts = {
      '0-1d': 0,
      '1-3d': 0,
      '3-7d': 0,
      '7+d': 0,
    };

    for (const t of allTickets.rows) {
      const createdAt = new Date(t.created_at);
      const slaDueAt = new Date(t.sla_due_at);
      const isTerminal = ['RESOLVED', 'CLOSED'].includes(t.status);

      // Ageing calculation
      const age = computeTicketAge(createdAt);
      ageingCounts[age.ageBracket]++;

      // SLA calculation
      if (isTerminal) {
        const resolvedAt = t.resolved_at ? new Date(t.resolved_at) : createdAt;
        if (resolvedAt > slaDueAt) {
          resolvedBreached++;
        } else {
          resolvedWithinSla++;
        }
      } else {
        const sla = computeTicketSla(createdAt, slaDueAt, t.status);
        if (sla.status === 'BREACHED') breachedCount++;
        else if (sla.status === 'AT_RISK') atRiskCount++;
        else onTrackCount++;
      }
    }

    res.json({
      success: true,
      data: {
        byCategory: categoryResult.rows.map(r => ({ name: r.name, code: r.code, count: parseInt(r.count, 10) })),
        byPriority: priorityResult.rows.map(r => ({ priority: r.priority, count: parseInt(r.count, 10) })),
        byStatus: statusResult.rows.map(r => ({ status: r.status, count: parseInt(r.count, 10) })),
        volumeOverTime: volumeResult.rows.map(r => ({
          date: r.date,
          created: parseInt(r.created_count, 10),
          resolved: parseInt(r.resolved_count, 10),
        })),
        slaPerformance: [
          { name: 'On Track', count: onTrackCount, color: '#10B981' },
          { name: 'At Risk (<20%)', count: atRiskCount, color: '#F59E0B' },
          { name: 'SLA Breached (Open)', count: breachedCount, color: '#EF4444' },
          { name: 'Resolved within SLA', count: resolvedWithinSla, color: '#3B82F6' },
          { name: 'Resolved Past SLA', count: resolvedBreached, color: '#9CA3AF' },
        ],
        ageingDistribution: [
          { bracket: '0–1 day', count: ageingCounts['0-1d'] },
          { bracket: '1–3 days', count: ageingCounts['1-3d'] },
          { bracket: '3–7 days', count: ageingCounts['3-7d'] },
          { bracket: '7+ days', count: ageingCounts['7+d'] },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
}
