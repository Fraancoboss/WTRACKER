export type EstadoPedido = 'Listo' | 'En curso' | 'Detenido' | 'No iniciado';
export type Material = 'PVC' | 'Aluminio';
export type EstadoModulo = 'Completado' | 'En proceso' | 'Pendiente' | 'Bloqueado';
export type RolUsuario = 'Oficina' | 'Admin' | 'Fabricación' | 'Cristal' | 'Persianas' | 'Transporte' | 'Visualización';
export type Modulo = 'Fabricación' | 'Cristal' | 'Persianas' | 'Transporte';

export interface Pedido {
  id: string;
  fechaEntrada: string;
  centro: string;
  material: Material;
  fechaVencimiento: string;
  estado: EstadoPedido;
  incidencias: string;
  transporte: boolean;
  moduloFabricacion?: ModuloDetalle;
  moduloCristal?: ModuloDetalle;
  moduloPersianas?: ModuloDetalle;
  moduloTransporte?: ModuloTransporteDetalle;
}

export interface ModuloDetalle {
  estado: EstadoModulo;
  fechaInicio?: string;
  fechaFin?: string;
  observaciones: string;
  operario: string;
}

export interface ModuloTransporteDetalle {
  estado: boolean;
  observaciones: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: RolUsuario;
  modulosAsignados: Modulo[];
}
