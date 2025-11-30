import { pool } from '../db/pool.js';
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors.js';
import logger from './logger.service.js';
import { PoolClient } from 'pg';

export interface Pedido {
    id: string;
    fechaEntrada: string;
    centro: string;
    material: 'PVC' | 'Aluminio';
    fechaVencimiento: string;
    estado: 'Listo' | 'En curso' | 'Detenido' | 'No iniciado';
    incidencias: string | null;
    transporte: boolean;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
    fases?: Fase[];
}

export interface Fase {
    id?: number;
    pedidoId: string;
    tipo: 'Fabricación' | 'Cristal' | 'Persianas' | 'Transporte';
    estado: 'Completado' | 'En proceso' | 'Pendiente' | 'Bloqueado';
    fechaInicio?: string | null;
    fechaFin?: string | null;
    operarioId?: number | null;
    observaciones?: string | null;
}

export interface PedidoFilters {
    centro?: string;
    material?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface Pagination {
    page: number;
    limit: number;
}

export class PedidoService {
    /**
     * Get all pedidos with optional filters and pagination
     */
    async getAllPedidos(
        filters?: PedidoFilters,
        pagination?: Pagination
    ): Promise<{ pedidos: Pedido[]; total: number; page: number; totalPages: number }> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        const offset = (page - 1) * limit;

        // Build WHERE clause
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters?.centro) {
            conditions.push(`centro = $${paramIndex++}`);
            params.push(filters.centro);
        }
        if (filters?.material) {
            conditions.push(`material = $${paramIndex++}`);
            params.push(filters.material);
        }
        if (filters?.estado) {
            conditions.push(`estado = $${paramIndex++}`);
            params.push(filters.estado);
        }
        if (filters?.fechaDesde) {
            conditions.push(`fecha_entrada >= $${paramIndex++}`);
            params.push(filters.fechaDesde);
        }
        if (filters?.fechaHasta) {
            conditions.push(`fecha_entrada <= $${paramIndex++}`);
            params.push(filters.fechaHasta);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM pedidos ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get pedidos
        const result = await pool.query(
            `SELECT id, fecha_entrada, centro, material, fecha_vencimiento,
              estado, incidencias, transporte, created_by, created_at, updated_at
       FROM pedidos
       ${whereClause}
       ORDER BY fecha_entrada DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
            [...params, limit, offset]
        );

        const pedidos = result.rows.map(this.mapPedidoRow);

        logger.info('Pedidos retrieved', { count: pedidos.length, filters, page });

        return {
            pedidos,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get pedido by ID with fases
     */
    async getPedidoById(id: string): Promise<Pedido> {
        const client = await pool.connect();
        try {
            // Get pedido
            const pedidoResult = await client.query(
                `SELECT id, fecha_entrada, centro, material, fecha_vencimiento,
                estado, incidencias, transporte, created_by, created_at, updated_at
         FROM pedidos
         WHERE id = $1`,
                [id]
            );

            if (pedidoResult.rows.length === 0) {
                throw new NotFoundError(`Pedido ${id} no encontrado`);
            }

            const pedido = this.mapPedidoRow(pedidoResult.rows[0]);

            // Get fases
            const fasesResult = await client.query(
                `SELECT id, pedido_id, tipo, estado, fecha_inicio, fecha_fin,
                operario_id, observaciones
         FROM fases
         WHERE pedido_id = $1
         ORDER BY 
           CASE tipo
             WHEN 'Fabricación' THEN 1
             WHEN 'Cristal' THEN 2
             WHEN 'Persianas' THEN 3
             WHEN 'Transporte' THEN 4
           END`,
                [id]
            );

            pedido.fases = fasesResult.rows.map(this.mapFaseRow);

            return pedido;
        } finally {
            client.release();
        }
    }

    /**
     * Create pedido with fases in a transaction
     */
    async createPedido(pedidoData: Pedido, userId: number): Promise<Pedido> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Validate pedido data
            this.validatePedido(pedidoData);

            // Insert pedido
            const pedidoResult = await client.query(
                `INSERT INTO pedidos (id, fecha_entrada, centro, material, fecha_vencimiento,
                              estado, incidencias, transporte, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, fecha_entrada, centro, material, fecha_vencimiento,
                   estado, incidencias, transporte, created_by, created_at, updated_at`,
                [
                    pedidoData.id,
                    pedidoData.fechaEntrada,
                    pedidoData.centro,
                    pedidoData.material,
                    pedidoData.fechaVencimiento,
                    pedidoData.estado || 'No iniciado',
                    pedidoData.incidencias || null,
                    pedidoData.transporte,
                    userId,
                ]
            );

            const pedido = this.mapPedidoRow(pedidoResult.rows[0]);

            // Insert fases if provided
            if (pedidoData.fases && pedidoData.fases.length > 0) {
                const fases: Fase[] = [];
                for (const fase of pedidoData.fases) {
                    const faseResult = await client.query(
                        `INSERT INTO fases (pedido_id, tipo, estado, fecha_inicio, fecha_fin,
                                operario_id, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, pedido_id, tipo, estado, fecha_inicio, fecha_fin,
                       operario_id, observaciones`,
                        [
                            pedido.id,
                            fase.tipo,
                            fase.estado || 'Pendiente',
                            fase.fechaInicio || null,
                            fase.fechaFin || null,
                            fase.operarioId || null,
                            fase.observaciones || null,
                        ]
                    );
                    fases.push(this.mapFaseRow(faseResult.rows[0]));
                }
                pedido.fases = fases;
            }

            // Log audit
            await client.query(
                `INSERT INTO audit_log (usuario_id, accion, entidad, entidad_id, datos_nuevos)
         VALUES ($1, 'CREATE', 'pedido', $2, $3)`,
                [userId, pedido.id, JSON.stringify(pedido)]
            );

            await client.query('COMMIT');

            logger.info('Pedido created', { pedidoId: pedido.id, userId });

            return pedido;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating pedido', { error, pedidoData });
            throw new DatabaseError('Error al crear pedido');
        } finally {
            client.release();
        }
    }

    /**
     * Update pedido with fases in a transaction
     */
    async updatePedido(id: string, pedidoData: Partial<Pedido>, userId: number): Promise<Pedido> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current pedido for audit
            const currentPedido = await this.getPedidoById(id);

            // Build update query
            const updates: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (pedidoData.fechaEntrada !== undefined) {
                updates.push(`fecha_entrada = $${paramIndex++}`);
                params.push(pedidoData.fechaEntrada);
            }
            if (pedidoData.centro !== undefined) {
                updates.push(`centro = $${paramIndex++}`);
                params.push(pedidoData.centro);
            }
            if (pedidoData.material !== undefined) {
                updates.push(`material = $${paramIndex++}`);
                params.push(pedidoData.material);
            }
            if (pedidoData.fechaVencimiento !== undefined) {
                updates.push(`fecha_vencimiento = $${paramIndex++}`);
                params.push(pedidoData.fechaVencimiento);
            }
            if (pedidoData.incidencias !== undefined) {
                updates.push(`incidencias = $${paramIndex++}`);
                params.push(pedidoData.incidencias);
            }
            if (pedidoData.transporte !== undefined) {
                updates.push(`transporte = $${paramIndex++}`);
                params.push(pedidoData.transporte);
            }

            // Update pedido if there are changes
            if (updates.length > 0) {
                params.push(id);
                await client.query(
                    `UPDATE pedidos SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
                    params
                );
            }

            // Update fases if provided
            if (pedidoData.fases) {
                for (const fase of pedidoData.fases) {
                    if (fase.id) {
                        // Update existing fase
                        await client.query(
                            `UPDATE fases
               SET estado = $1, fecha_inicio = $2, fecha_fin = $3,
                   operario_id = $4, observaciones = $5
               WHERE id = $6 AND pedido_id = $7`,
                            [
                                fase.estado,
                                fase.fechaInicio || null,
                                fase.fechaFin || null,
                                fase.operarioId || null,
                                fase.observaciones || null,
                                fase.id,
                                id,
                            ]
                        );
                    } else {
                        // Insert new fase
                        await client.query(
                            `INSERT INTO fases (pedido_id, tipo, estado, fecha_inicio, fecha_fin,
                                  operario_id, observaciones)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                            [
                                id,
                                fase.tipo,
                                fase.estado,
                                fase.fechaInicio || null,
                                fase.fechaFin || null,
                                fase.operarioId || null,
                                fase.observaciones || null,
                            ]
                        );
                    }
                }
            }

            // Get updated pedido
            const updatedPedido = await this.getPedidoById(id);

            // Log audit
            await client.query(
                `INSERT INTO audit_log (usuario_id, accion, entidad, entidad_id,
                                datos_anteriores, datos_nuevos)
         VALUES ($1, 'UPDATE', 'pedido', $2, $3, $4)`,
                [userId, id, JSON.stringify(currentPedido), JSON.stringify(updatedPedido)]
            );

            await client.query('COMMIT');

            logger.info('Pedido updated', { pedidoId: id, userId });

            return updatedPedido;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating pedido', { error, pedidoId: id });
            throw new DatabaseError('Error al actualizar pedido');
        } finally {
            client.release();
        }
    }

    /**
     * Delete pedido (soft delete by setting estado)
     */
    async deletePedido(id: string, userId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current pedido for audit
            const pedido = await this.getPedidoById(id);

            // Delete pedido (CASCADE will delete fases)
            const result = await client.query('DELETE FROM pedidos WHERE id = $1', [id]);

            if (result.rowCount === 0) {
                throw new NotFoundError(`Pedido ${id} no encontrado`);
            }

            // Log audit
            await client.query(
                `INSERT INTO audit_log (usuario_id, accion, entidad, entidad_id, datos_anteriores)
         VALUES ($1, 'DELETE', 'pedido', $2, $3)`,
                [userId, id, JSON.stringify(pedido)]
            );

            await client.query('COMMIT');

            logger.info('Pedido deleted', { pedidoId: id, userId });
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error deleting pedido', { error, pedidoId: id });
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Validate pedido data
     */
    private validatePedido(pedido: Pedido): void {
        if (!pedido.id || pedido.id.trim() === '') {
            throw new ValidationError('ID de pedido es requerido');
        }
        if (!pedido.fechaEntrada) {
            throw new ValidationError('Fecha de entrada es requerida');
        }
        if (!pedido.centro || pedido.centro.trim() === '') {
            throw new ValidationError('Centro es requerido');
        }
        if (!pedido.material || !['PVC', 'Aluminio'].includes(pedido.material)) {
            throw new ValidationError('Material debe ser PVC o Aluminio');
        }
        if (!pedido.fechaVencimiento) {
            throw new ValidationError('Fecha de vencimiento es requerida');
        }
    }

    /**
     * Map database row to Pedido object
     */
    private mapPedidoRow(row: any): Pedido {
        return {
            id: row.id,
            fechaEntrada: row.fecha_entrada,
            centro: row.centro,
            material: row.material,
            fechaVencimiento: row.fecha_vencimiento,
            estado: row.estado,
            incidencias: row.incidencias,
            transporte: row.transporte,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    /**
     * Map database row to Fase object
     */
    private mapFaseRow(row: any): Fase {
        return {
            id: row.id,
            pedidoId: row.pedido_id,
            tipo: row.tipo,
            estado: row.estado,
            fechaInicio: row.fecha_inicio,
            fechaFin: row.fecha_fin,
            operarioId: row.operario_id,
            observaciones: row.observaciones,
        };
    }
}

export const pedidoService = new PedidoService();
