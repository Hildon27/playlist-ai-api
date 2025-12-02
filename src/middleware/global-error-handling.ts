import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../models/Errors';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default payload
  const response: {
    success: boolean;
    message: string;
    code?: string | number;
    errors?: { path: string; message: string }[];
  } = {
    success: false,
    message: '',
  };

  if (err instanceof ZodError) {
    response.message = 'Validation failed';
    response.errors = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(422).json(response);
  }

  if (err instanceof ApiError) {
    response.message = err.message;
    response.code = err.code;
    return res.status(err.status).json(response);
  }

  // Unexpected Error
  console.error(err); // Log error for debugging
  response.message = 'Internal server error';
  return res.status(500).json(response);
};
