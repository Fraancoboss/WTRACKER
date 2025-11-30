import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../services/logger.service.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Default error values
    let statusCode = 500;
    let message = 'Error interno del servidor';
    let isOperational = false;

    // If it's our custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Log the error
    const errorLog = {
        message: err.message,
        stack: err.stack,
        statusCode,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: (req as any).user?.id,
    };

    if (statusCode >= 500) {
        logger.error('Server error', errorLog);
    } else {
        logger.warn('Client error', errorLog);
    }

    // Send error response
    const response: any = {
        success: false,
        message,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.error = err;
    }

    res.status(statusCode).json(response);
};

/**
 * Catch 404 and forward to error handler
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
    const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
