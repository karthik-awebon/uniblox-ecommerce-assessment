/**
 * Custom Error class for handling application-specific errors.
 * This allows us to differentiate between known operational errors and unexpected programming errors.
 */
export class AppError extends Error {
  /**
   * The HTTP status code associated with the error.
   */
  public readonly statusCode: number;
  /**
   * A flag to indicate that this is an operational error (e.g., user input error),
   * not a programming error.
   */
  public readonly isOperational: boolean;

  /**
   * Creates an instance of AppError.
   * @param message - The error message.
   * @param statusCode - The HTTP status code to be returned.
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture the stack trace for easier debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
