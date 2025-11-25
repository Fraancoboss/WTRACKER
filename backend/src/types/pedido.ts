import { z } from 'zod';

export const moduloDetalleSchema = z.object({
  estado: z.enum(['Completado', 'En proceso', 'Pendiente', 'Bloqueado']),
  fechaInicio: z.string().optional().nullable(),
  fechaFin: z.string().optional().nullable(),
  observaciones: z.string().optional().default(''),
  operario: z.string().optional().default(''),
});

export const moduloTransporteSchema = z.object({
  estado: z.boolean(),
  observaciones: z.string().optional().default(''),
});

export const pedidoSchema = z.object({
  id: z.string(),
  fechaEntrada: z.string(),
  centro: z.string(),
  material: z.enum(['PVC', 'Aluminio']),
  fechaVencimiento: z.string(),
  estado: z.enum(['Listo', 'En curso', 'Detenido', 'No iniciado']),
  incidencias: z.string().nullable().optional().default(''),
  transporte: z.boolean(),
  moduloFabricacion: moduloDetalleSchema.optional(),
  moduloCristal: moduloDetalleSchema.optional(),
  moduloPersianas: moduloDetalleSchema.optional(),
  moduloTransporte: moduloTransporteSchema.optional(),
});

export type Pedido = z.infer<typeof pedidoSchema>;
