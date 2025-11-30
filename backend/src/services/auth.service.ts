import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { AuthenticationError, ValidationError, ConflictError } from '../utils/errors.js';
import logger from './logger.service.js';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

export interface Usuario {
    id: number;
    nombre: string;
    email: string | null;
    rol: string;
    activo: boolean;
}

export interface TokenPayload {
    id: number;
    nombre: string;
    rol: string;
}

export interface AuthResponse {
    user: Usuario;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    /**
     * Hash a password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    /**
     * Compare password with hash
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate JWT access token
     */
    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    /**
     * Generate JWT refresh token
     */
    generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new AuthenticationError('Token inválido o expirado');
        }
    }

    /**
     * Register a new user
     */
    async register(
        nombre: string,
        password: string,
        email: string | null,
        rol: string
    ): Promise<AuthResponse> {
        // Validate input
        if (!nombre || nombre.length < 3) {
            throw new ValidationError('El nombre debe tener al menos 3 caracteres');
        }
        if (!password || password.length < 6) {
            throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
        }
        if (!rol) {
            throw new ValidationError('El rol es requerido');
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM usuarios WHERE nombre = $1',
            [nombre]
        );

        if (existingUser.rows.length > 0) {
            throw new ConflictError('El usuario ya existe');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Insert user
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, nombre, email, rol, activo`,
            [nombre, email, passwordHash, rol]
        );

        const user = result.rows[0];

        logger.info('User registered', { userId: user.id, nombre: user.nombre, rol: user.rol });

        // Generate tokens
        const tokenPayload: TokenPayload = {
            id: user.id,
            nombre: user.nombre,
            rol: user.rol,
        };

        return {
            user,
            accessToken: this.generateAccessToken(tokenPayload),
            refreshToken: this.generateRefreshToken(tokenPayload),
        };
    }

    /**
     * Login user
     */
    async login(nombre: string, password: string): Promise<AuthResponse> {
        // Validate input
        if (!nombre || !password) {
            throw new ValidationError('Nombre y contraseña son requeridos');
        }

        // Get user from database
        const result = await pool.query(
            `SELECT id, nombre, email, password_hash, rol, activo
       FROM usuarios
       WHERE nombre = $1`,
            [nombre]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('Credenciales inválidas');
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.activo) {
            throw new AuthenticationError('Usuario desactivado');
        }

        // Compare password
        const isPasswordValid = await this.comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            throw new AuthenticationError('Credenciales inválidas');
        }

        logger.info('User logged in', { userId: user.id, nombre: user.nombre });

        // Generate tokens
        const tokenPayload: TokenPayload = {
            id: user.id,
            nombre: user.nombre,
            rol: user.rol,
        };

        // Remove password_hash from response
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken: this.generateAccessToken(tokenPayload),
            refreshToken: this.generateRefreshToken(tokenPayload),
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const payload = this.verifyToken(refreshToken);

            // Verify user still exists and is active
            const result = await pool.query(
                'SELECT id, nombre, rol, activo FROM usuarios WHERE id = $1',
                [payload.id]
            );

            if (result.rows.length === 0 || !result.rows[0].activo) {
                throw new AuthenticationError('Usuario no válido');
            }

            const user = result.rows[0];
            const tokenPayload: TokenPayload = {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol,
            };

            return {
                accessToken: this.generateAccessToken(tokenPayload),
            };
        } catch (error) {
            throw new AuthenticationError('Token de refresco inválido');
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<Usuario | null> {
        const result = await pool.query(
            'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1',
            [id]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    /**
     * Change user password
     */
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            throw new ValidationError('La nueva contraseña debe tener al menos 6 caracteres');
        }

        // Get current password hash
        const result = await pool.query(
            'SELECT password_hash FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('Usuario no encontrado');
        }

        // Verify old password
        const isOldPasswordValid = await this.comparePassword(
            oldPassword,
            result.rows[0].password_hash
        );

        if (!isOldPasswordValid) {
            throw new AuthenticationError('Contraseña actual incorrecta');
        }

        // Hash new password
        const newPasswordHash = await this.hashPassword(newPassword);

        // Update password
        await pool.query(
            'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
            [newPasswordHash, userId]
        );

        logger.info('Password changed', { userId });
    }
}

export const authService = new AuthService();
