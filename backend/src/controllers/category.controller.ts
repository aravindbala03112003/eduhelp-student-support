import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT id, name, code, description, default_sla_hours, is_active
       FROM categories
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
