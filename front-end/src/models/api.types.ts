// src/models/api.types.ts

export interface Item {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  name?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  statusCode: number;
  body: T;
  headers: Record<string, string>;
}

export interface ApiErrorResponse {
  statusCode: number;
  body: {
    message: string;
    code?: string;
    details?: unknown;
  };
  headers: Record<string, string>;
}

// Optional: Add custom error class if you want to throw typed errors
export class ApiRequestError extends Error implements ApiError {
  code?: string;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiRequestError);
    }
  }
}
