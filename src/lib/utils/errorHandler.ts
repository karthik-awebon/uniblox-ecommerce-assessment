import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './AppError';

/**
 * Standardized Error Handler for Next.js Route Handlers.
 * Catches: AppError, ZodError, and generic Errors.
 */
export function handleApiError(error: unknown) {
    // Handle Trusted "AppError" (Business Logic Failures)
    if (error instanceof AppError) {
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: error.statusCode }
        );
    }

    // Handle Zod Validation Errors (Bad Requests)
    if (error instanceof ZodError) {
        const { fieldErrors, formErrors } = error.flatten();
        const errorMessages = [
            ...formErrors,
            ...Object.entries(fieldErrors).map(([path, messages]) =>
                `${path}: ${(messages as string[]).join(', ')}`
            )
        ];

        return NextResponse.json(
            {
                success: false,
                error: 'Validation Failed',
                details: errorMessages
            },
            { status: 400 }
        );
    }

    // Handle Unknown/Crash Errors (Catch-all)
    // Log this to your monitoring service (e.g. Sentry/Datadog)
    console.error('CRITICAL SERVER ERROR:', error);

    return NextResponse.json(
        {
            success: false,
            error: 'Internal Server Error'
        },
        { status: 500 }
    );
}