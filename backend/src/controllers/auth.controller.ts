import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      `SELECT id, name, email, password_hash, role, department, phone, avatar_url
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'eduhelp_super_secret_jwt_key_2026_dev_mode';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn: expiresIn as any });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }

    const userResult = await pool.query(
      `SELECT id, name, email, role, department, phone, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const user = userResult.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}
