export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // Capture the stack trace for easier debugging
        Error.captureStackTrace(this, this.constructor);
    }
}