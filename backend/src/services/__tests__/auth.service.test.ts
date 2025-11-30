import { AuthService } from '../../services/auth.service';

// Mock the database pool
jest.mock('../../db/pool.js', () => ({
    pool: {
        query: jest.fn(),
    },
}));

import { pool } from '../../db/pool.js';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'testpassword123';
            const hash = await authService.hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.startsWith('$2b$')).toBe(true);
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching password', async () => {
            const password = 'testpassword123';
            const hash = await authService.hashPassword(password);

            const result = await authService.comparePassword(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for non-matching password', async () => {
            const password = 'testpassword123';
            const wrongPassword = 'wrongpassword';
            const hash = await authService.hashPassword(password);

            const result = await authService.comparePassword(wrongPassword, hash);
            expect(result).toBe(false);
        });
    });

    describe('generateAccessToken', () => {
        it('should generate a valid JWT token', () => {
            const payload = { id: 1, nombre: 'testuser', rol: 'Admin' };
            const token = authService.generateAccessToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const payload = { id: 1, nombre: 'testuser', rol: 'Admin' };
            const token = authService.generateAccessToken(payload);

            const verified = authService.verifyToken(token);
            expect(verified.id).toBe(payload.id);
            expect(verified.nombre).toBe(payload.nombre);
            expect(verified.rol).toBe(payload.rol);
        });

        it('should throw error for invalid token', () => {
            expect(() => {
                authService.verifyToken('invalid.token.here');
            }).toThrow();
        });
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: 1,
                nombre: 'testuser',
                email: 'test@example.com',
                password_hash: await authService.hashPassword('password123'),
                rol: 'Admin',
                activo: true,
            };

            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [mockUser],
            });

            const result = await authService.login('testuser', 'password123');

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.nombre).toBe('testuser');
        });

        it('should throw error for invalid credentials', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [],
            });

            await expect(
                authService.login('nonexistent', 'password')
            ).rejects.toThrow('Credenciales inválidas');
        });

        it('should throw error for inactive user', async () => {
            const mockUser = {
                id: 1,
                nombre: 'testuser',
                password_hash: await authService.hashPassword('password123'),
                rol: 'Admin',
                activo: false,
            };

            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [mockUser],
            });

            await expect(
                authService.login('testuser', 'password123')
            ).rejects.toThrow('Usuario desactivado');
        });
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Mock check for existing user
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [],
            });

            // Mock insert user
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    nombre: 'newuser',
                    email: 'new@example.com',
                    rol: 'Oficina',
                    activo: true,
                }],
            });

            const result = await authService.register(
                'newuser',
                'password123',
                'new@example.com',
                'Oficina'
            );

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.nombre).toBe('newuser');
        });

        it('should throw error if user already exists', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [{ id: 1 }],
            });

            await expect(
                authService.register('existing', 'password123', null, 'Admin')
            ).rejects.toThrow('El usuario ya existe');
        });

        it('should throw validation error for short password', async () => {
            await expect(
                authService.register('newuser', '123', null, 'Admin')
            ).rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
        });
    });
});
