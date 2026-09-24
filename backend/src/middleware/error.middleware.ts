import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[API Error]:', err);

  // PostgreSQL unique violation error code
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      message: 'A duplicate record with this unique identifier already exists.',
    });
    return;
  }

  // PostgreSQL foreign key violation error code
  if (err.code === '23503') {
    res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist or cannot be modified.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected server error occurred.'
      : message,
  });
}
