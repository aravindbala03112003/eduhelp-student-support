import { pool } from '../config/db.js';

export async function generateTicketNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `EDU-${dateStr}-`;

  // Count tickets created today to determine the next sequence number atomically
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM tickets WHERE ticket_number LIKE $1`,
    [`${prefix}%`]
  );

  const count = parseInt(result.rows[0].count, 10) + 1;
  const sequence = String(count).padStart(4, '0');
  const ticketNumber = `${prefix}${sequence}`;

  return ticketNumber;
}
