import { Router } from 'express';
import { pool } from '../db/pool.js';
import { Pedido, pedidoSchema } from '../types/pedido.js';

const router = Router();

const mapPedidoRow = (row: Record<string, any>): Pedido => ({
  id: row.id,
  fechaEntrada: row.fecha_entrada,
  centro: row.centro,
  material: row.material,
  fechaVencimiento: row.fecha_vencimiento,
  estado: row.estado,
  incidencias: row.incidencias ?? '',
  transporte: row.transporte,
  moduloFabricacion: row.modulo_fabricacion ?? undefined,
  moduloCristal: row.modulo_cristal ?? undefined,
  moduloPersianas: row.modulo_persianas ?? undefined,
  moduloTransporte: row.modulo_transporte ?? undefined,
});

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY fecha_entrada DESC');
    res.json(rows.map(mapPedidoRow));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(mapPedidoRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const pedido = pedidoSchema.parse(req.body);
    const query = `
      INSERT INTO pedidos (
        id, fecha_entrada, centro, material, fecha_vencimiento,
        estado, incidencias, transporte,
        modulo_fabricacion, modulo_cristal, modulo_persianas, modulo_transporte
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;
    const values = [
      pedido.id,
      pedido.fechaEntrada,
      pedido.centro,
      pedido.material,
      pedido.fechaVencimiento,
      pedido.estado,
      pedido.incidencias ?? '',
      pedido.transporte,
      pedido.moduloFabricacion ?? null,
      pedido.moduloCristal ?? null,
      pedido.moduloPersianas ?? null,
      pedido.moduloTransporte ?? null,
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(mapPedidoRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const pedido = pedidoSchema.parse({ ...req.body, id: req.params.id });
    const query = `
      UPDATE pedidos SET
        fecha_entrada = $2,
        centro = $3,
        material = $4,
        fecha_vencimiento = $5,
        estado = $6,
        incidencias = $7,
        transporte = $8,
        modulo_fabricacion = $9,
        modulo_cristal = $10,
        modulo_persianas = $11,
        modulo_transporte = $12
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      pedido.id,
      pedido.fechaEntrada,
      pedido.centro,
      pedido.material,
      pedido.fechaVencimiento,
      pedido.estado,
      pedido.incidencias ?? '',
      pedido.transporte,
      pedido.moduloFabricacion ?? null,
      pedido.moduloCristal ?? null,
      pedido.moduloPersianas ?? null,
      pedido.moduloTransporte ?? null,
    ];
    const { rows } = await pool.query(query, values);
    if (!rows.length) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(mapPedidoRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

export default router;
