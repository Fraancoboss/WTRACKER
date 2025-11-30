import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/auth.service.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('Token no proporcionado');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = authService.verifyToken(token);

        // Attach user to request
        req.user = payload;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to authorize requests based on user roles
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AuthenticationError('Usuario no autenticado'));
        }

        if (!roles.includes(req.user.rol)) {
            return next(
                new AuthorizationError(
                    `Acceso denegado. Roles permitidos: ${roles.join(', ')}`
                )
            );
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = authService.verifyToken(token);
            req.user = payload;
        }

        next();
    } catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
};
