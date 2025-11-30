import { Router } from 'express';
import { pedidoService } from '../services/pedido.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Get all pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: centro
 *         schema:
 *           type: string
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *           enum: [PVC, Aluminio]
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Listo, En curso, Detenido, No iniciado]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of pedidos
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = {
      centro: req.query.centro as string,
      material: req.query.material as string,
      estado: req.query.estado as string,
      fechaDesde: req.query.fechaDesde as string,
      fechaHasta: req.query.fechaHasta as string,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await pedidoService.getAllPedidos(filters, pagination);
    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Get pedido by ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido details
 *       404:
 *         description: Pedido not found
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pedido = await pedidoService.getPedidoById(req.params.id);
    res.json({
      success: true,
      data: pedido,
    });
  })
);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Create new pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - fechaEntrada
 *               - centro
 *               - material
 *               - fechaVencimiento
 *               - transporte
 *             properties:
 *               id:
 *                 type: string
 *                 example: PED-2025-007
 *               fechaEntrada:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-20
 *               centro:
 *                 type: string
 *                 example: Alcobendas
 *               material:
 *                 type: string
 *                 enum: [PVC, Aluminio]
 *               fechaVencimiento:
 *                 type: string
 *                 format: date
 *               transporte:
 *                 type: boolean
 *               incidencias:
 *                 type: string
 *               fases:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Pedido created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authorize('Admin', 'Oficina'),
  asyncHandler(async (req, res) => {
    const pedido = await pedidoService.createPedido(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: pedido,
    });
  })
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Update pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Pedido updated
 *       404:
 *         description: Pedido not found
 *       403:
 *         description: Not authorized
 */
router.put(
  '/:id',
  authorize('Admin', 'Oficina', 'Fabricación', 'Cristal', 'Persianas', 'Transporte'),
  asyncHandler(async (req, res) => {
    const pedido = await pedidoService.updatePedido(req.params.id, req.body, req.user!.id);
    res.json({
      success: true,
      data: pedido,
    });
  })
);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Delete pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido deleted
 *       404:
 *         description: Pedido not found
 *       403:
 *         description: Not authorized
 */
router.delete(
  '/:id',
  authorize('Admin'),
  asyncHandler(async (req, res) => {
    await pedidoService.deletePedido(req.params.id, req.user!.id);
    res.json({
      success: true,
      message: 'Pedido eliminado exitosamente',
    });
  })
);

export default router;
