import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@/lib/logger';

const httpLogger = createLogger('HTTP');

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  httpLogger.info(
    { method: req.method, url: req.originalUrl },
    'Incoming request'
  );

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      httpLogger.warn(logData, 'Request completed with error');
    } else {
      httpLogger.info(logData, 'Request completed');
    }
  });

  next();
};
