import pino, { LoggerOptions } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
};

export const logger = pino(options);

export const createLogger = (context: string) => logger.child({ context });
