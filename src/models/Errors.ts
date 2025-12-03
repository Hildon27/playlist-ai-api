/**
 * Error code to message mapping for the User Management API
 * This centralized approach enables better localization and consistent error handling
 */

// Error code prefixes by domain
// USER - User-related errors (1000-1999)
// VALIDATION - Generic validation errors (2000-2999)
// SYSTEM - System errors (9000-9999)

export enum ErrorCode {
  // User errors (1000-1999)
  USER_NOT_FOUND = 1000,
  USER_EMAIL_IN_USE = 1001,
  USER_CREATE_FAILED = 1002,
  USER_UPDATE_FAILED = 1003,
  USER_DELETE_FAILED = 1004,
  USER_FETCH_FAILED = 1005,

  // Validation errors (2000-2999)
  VALIDATION_USER_ID_REQUIRED = 2000,
  VALIDATION_EMAIL_INVALID = 2001,
  VALIDATION_PASSWORD_TOO_SHORT = 2002,
  VALIDATION_MISSING_FIELDS = 2003,
  VALIDATION_INVALID_PRIVACY = 2004,
  VALIDATION_INVALID_FIELDS = 2005,

  // Follow Request errors (3000)
  FOLLOW_REQUEST_NOT_FOUND = 3000,
  FOLLOW_REQUEST_ALREADY_EXISTS = 3001,
  FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND = 3002,
  FOLLOW_REQUEST_NOT_PENDING = 3003,
  FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS = 3004,

  // System errors (9000-9999)
  SYSTEM_ERROR = 9000,
  DATABASE_ERROR = 9001,
}

interface ErrorResponse {
  code: ErrorCode;
  message: string;
  status: number;
}

/**
 * Error dictionary that maps error codes to error messages and HTTP status codes
 */
export const errorDictionary: Record<ErrorCode, ErrorResponse> = {
  // User errors
  [ErrorCode.USER_NOT_FOUND]: {
    code: ErrorCode.USER_NOT_FOUND,
    message: 'User not found',
    status: 404,
  },
  [ErrorCode.USER_EMAIL_IN_USE]: {
    code: ErrorCode.USER_EMAIL_IN_USE,
    message: 'Email is already in use by another user',
    status: 409,
  },
  [ErrorCode.USER_CREATE_FAILED]: {
    code: ErrorCode.USER_CREATE_FAILED,
    message: 'Failed to create user',
    status: 500,
  },
  [ErrorCode.USER_UPDATE_FAILED]: {
    code: ErrorCode.USER_UPDATE_FAILED,
    message: 'Failed to update user',
    status: 500,
  },
  [ErrorCode.USER_DELETE_FAILED]: {
    code: ErrorCode.USER_DELETE_FAILED,
    message: 'Failed to delete user',
    status: 500,
  },
  [ErrorCode.USER_FETCH_FAILED]: {
    code: ErrorCode.USER_FETCH_FAILED,
    message: 'Failed to fetch user data',
    status: 500,
  },

  // Validation errors
  [ErrorCode.VALIDATION_USER_ID_REQUIRED]: {
    code: ErrorCode.VALIDATION_USER_ID_REQUIRED,
    message: 'User ID is required',
    status: 400,
  },
  [ErrorCode.VALIDATION_EMAIL_INVALID]: {
    code: ErrorCode.VALIDATION_EMAIL_INVALID,
    message: 'Invalid email format',
    status: 400,
  },
  [ErrorCode.VALIDATION_PASSWORD_TOO_SHORT]: {
    code: ErrorCode.VALIDATION_PASSWORD_TOO_SHORT,
    message: 'Password must be at least 6 characters long',
    status: 400,
  },
  [ErrorCode.VALIDATION_MISSING_FIELDS]: {
    code: ErrorCode.VALIDATION_MISSING_FIELDS,
    message: 'Required fields are missing',
    status: 400,
  },
  [ErrorCode.VALIDATION_INVALID_PRIVACY]: {
    code: ErrorCode.VALIDATION_INVALID_PRIVACY,
    message: 'Invalid privacy setting',
    status: 400,
  },
  [ErrorCode.VALIDATION_INVALID_FIELDS]: {
    code: ErrorCode.VALIDATION_INVALID_FIELDS,
    message: 'Invalid field values provided',
    status: 400,
  },

  // Follow requests errors
  [ErrorCode.FOLLOW_REQUEST_NOT_FOUND]: {
    code: ErrorCode.FOLLOW_REQUEST_NOT_FOUND,
    message: 'Follow request not found',
    status: 404,
  },
  [ErrorCode.FOLLOW_REQUEST_ALREADY_EXISTS]: {
    code: ErrorCode.FOLLOW_REQUEST_ALREADY_EXISTS,
    message: 'Follow request already exists',
    status: 409,
  },
  [ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND]: {
    code: ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND,
    message: 'Public user to follow not found',
    status: 404,
  },
  [ErrorCode.FOLLOW_REQUEST_NOT_PENDING]: {
    code: ErrorCode.FOLLOW_REQUEST_NOT_PENDING,
    message: 'Follow request is not pending',
    status: 400,
  },
  [ErrorCode.FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS]: {
    code: ErrorCode.FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS,
    message: 'Follower ID and Followed ID can not be equals',
    status: 400,
  },

  // System errors
  [ErrorCode.SYSTEM_ERROR]: {
    code: ErrorCode.SYSTEM_ERROR,
    message: 'A system error occurred',
    status: 500,
  },
  [ErrorCode.DATABASE_ERROR]: {
    code: ErrorCode.DATABASE_ERROR,
    message: 'A database error occurred',
    status: 500,
  },
};

/**
 * Create an API error response
 * @param code Error code from the ErrorCode enum
 * @param customMessage Optional custom message to override the default
 * @returns Error response object with code, message, and HTTP status
 */
export function createErrorResponse(
  code: ErrorCode,
  customMessage?: string
): ErrorResponse {
  const error = errorDictionary[code];

  if (!error) {
    return {
      code: ErrorCode.SYSTEM_ERROR,
      message: 'Unknown error',
      status: 500,
    };
  }

  if (customMessage) {
    return {
      ...error,
      message: customMessage,
    };
  }

  return error;
}

/**
 * API Error class that includes error code and HTTP status
 */
export class ApiError extends Error {
  code: ErrorCode;
  status: number;

  constructor(errorCode: ErrorCode, customMessage?: string) {
    const error = createErrorResponse(errorCode, customMessage);
    super(error.message);
    this.code = error.code;
    this.status = error.status;
    this.name = 'ApiError';
  }
}

// Legacy error classes for backward compatibility (deprecated)
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}
