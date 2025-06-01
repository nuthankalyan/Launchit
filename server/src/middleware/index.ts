import { Request, Response, NextFunction } from 'express';

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

// Error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`${new Date().toISOString()} - Error:`, err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};
