// Error handling utilities for the chat system

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_INPUT = 'INVALID_INPUT',
  MEMORY_OVERFLOW = 'MEMORY_OVERFLOW',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export class ChatError extends Error {
  public readonly code: ErrorCode;
  public readonly recoverable: boolean;
  public readonly timestamp: Date;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, recoverable: boolean = true, details?: any) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.recoverable = recoverable;
    this.timestamp = new Date();
    this.details = details;
  }
}

export const errorMessages = {
  [ErrorCode.NETWORK_ERROR]: "Connection failed. Please check your internet connection.",
  [ErrorCode.API_TIMEOUT]: "Request timed out. Please try again.",
  [ErrorCode.RATE_LIMIT]: "Too many requests. Please wait a moment before trying again.",
  [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please refresh the page.",
  [ErrorCode.INVALID_INPUT]: "Invalid input. Please check your message and try again.",
  [ErrorCode.MEMORY_OVERFLOW]: "Chat history is full. Some older messages may be cleared.",
  [ErrorCode.AI_SERVICE_ERROR]: "AI service is temporarily unavailable. Please try again.",
  [ErrorCode.VALIDATION_ERROR]: "Input validation failed. Please check your message.",
  [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again."
};

export function createError(
  code: ErrorCode, 
  customMessage?: string, 
  recoverable: boolean = true,
  details?: any
): ChatError {
  const message = customMessage || errorMessages[code];
  return new ChatError(code, message, recoverable, details);
}

export function handleApiError(error: any): ChatError {
  console.error('API Error:', error);

  if (!navigator.onLine) {
    return createError(ErrorCode.NETWORK_ERROR, "You're offline. Please check your connection.");
  }

  if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
    return createError(ErrorCode.API_TIMEOUT);
  }

  if (error.status === 429) {
    return createError(ErrorCode.RATE_LIMIT);
  }

  if (error.status === 401 || error.status === 403) {
    return createError(ErrorCode.SESSION_EXPIRED, "Authentication failed. Please refresh the page.", false);
  }

  if (error.status >= 500) {
    return createError(ErrorCode.AI_SERVICE_ERROR);
  }

  return createError(ErrorCode.UNKNOWN_ERROR, error.message);
}

export function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        resolve(result);
        return;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          reject(handleApiError(error));
          return;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  });
}

export function validateInput(input: string): void {
  if (!input || typeof input !== 'string') {
    throw createError(ErrorCode.INVALID_INPUT, "Message cannot be empty");
  }

  if (input.length > 10000) {
    throw createError(ErrorCode.INVALID_INPUT, "Message is too long (max 10,000 characters)");
  }

  if (input.trim().length === 0) {
    throw createError(ErrorCode.INVALID_INPUT, "Message cannot be empty");
  }
}

export function isRecoverableError(error: any): boolean {
  if (error instanceof ChatError) {
    return error.recoverable;
  }
  return true; // Assume recoverable if unknown
}

export function getErrorMessage(error: any): string {
  if (error instanceof ChatError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return errorMessages[ErrorCode.UNKNOWN_ERROR];
}

// Memory monitoring
export function checkMemoryUsage(): void {
  const maxSessions = 50;
  const maxMessagesPerSession = 500;
  
  // This would be implemented with actual memory monitoring in a real app
  // For now, we'll do basic checks
  
  if (typeof window !== 'undefined' && 'performance' in window) {
    // @ts-ignore
    const memory = (performance as any).memory;
    if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
      throw createError(
        ErrorCode.MEMORY_OVERFLOW, 
        "Memory usage is high. Consider refreshing the page.",
        true,
        { heapUsage: memory.usedJSHeapSize }
      );
    }
  }
}

export const ErrorBoundary = {
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }
};