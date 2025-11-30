import { Router } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: juan.perez
 *               email:
 *                 type: string
 *                 example: juan.perez@wtracker.com
 *               password:
 *                 type: string
 *                 example: password123
 *               rol:
 *                 type: string
 *                 enum: [Admin, Oficina, Fabricación, Cristal, Persianas, Transporte, Visualización]
 *                 example: Fabricación
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post(
    '/register',
    asyncHandler(async (req, res) => {
        const { nombre, email, password, rol } = req.body;
        const result = await authService.register(nombre, password, email || null, rol);
        res.status(201).json({
            success: true,
            data: result,
        });
    })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { nombre, password } = req.body;
        const result = await authService.login(nombre, password);
        res.json({
            success: true,
            data: result,
        });
    })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await authService.refreshAccessToken(refreshToken);
        res.json({
            success: true,
            data: result,
        });
    })
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *       401:
 *         description: Not authenticated
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const user = await authService.getUserById(req.user!.id);
        res.json({
            success: true,
            data: user,
        });
    })
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid old password
 */
router.post(
    '/change-password',
    authenticate,
    asyncHandler(async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        await authService.changePassword(req.user!.id, oldPassword, newPassword);
        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente',
        });
    })
);

export default router;
