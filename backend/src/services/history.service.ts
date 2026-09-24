import { pool } from '../config/db.js';

export async function logTicketHistory(
  ticketId: string,
  userId: string,
  action: string,
  oldValue: string | null = null,
  newValue: string | null = null
): Promise<void> {
  await pool.query(
    `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [ticketId, userId, action, oldValue, newValue]
  );
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  ticketId?: string
): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, ticket_id, title, message, is_read, created_at)
     VALUES ($1, $2, $3, $4, FALSE, NOW())`,
    [userId, ticketId || null, title, message]
  );
}
