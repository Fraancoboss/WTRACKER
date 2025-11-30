import { Pedido, Modulo, ModuloDetalle } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

type FaseApi = {
  id?: number;
  tipo: Modulo;
  estado: ModuloDetalle['estado'];
  fechaInicio?: string | null;
  fechaFin?: string | null;
  observaciones?: string | null;
  operarioId?: number | null;
};

type PedidoApi = {
  id: string;
  fechaEntrada: string;
  centro: string;
  material: Pedido['material'];
  fechaVencimiento: string;
  estado: Pedido['estado'];
  incidencias?: string | null;
  transporte: boolean;
  fases?: FaseApi[];
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('accessToken');

  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/'; // Redirect to login
    throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
  }

  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }
  const data = await response.json();
  return data.data; // Backend returns { success: true, data: ... }
}

function findFase(fases: FaseApi[] | undefined, tipo: Modulo) {
  return fases?.find((fase) => fase.tipo === tipo);
}

function mapFaseToModulo(tipo: Modulo, fase?: FaseApi): ModuloDetalle {
  if (!fase) {
    return {
      estado: 'Pendiente',
      observaciones: '',
      operario: '',
    };
  }
  return {
    id: fase.id,
    estado: fase.estado,
    fechaInicio: fase.fechaInicio || undefined,
    fechaFin: fase.fechaFin || undefined,
    observaciones: fase.observaciones || '',
    operario: fase.operarioId ? String(fase.operarioId) : '',
  };
}

function mapModuloToFase(tipo: Modulo, modulo?: ModuloDetalle) {
  if (!modulo) return null;
  return {
    id: modulo.id,
    tipo,
    estado: modulo.estado,
    fechaInicio: modulo.fechaInicio || null,
    fechaFin: modulo.fechaFin || null,
    observaciones: modulo.observaciones || null,
    operarioId: null,
  } satisfies FaseApi;
}

function normalizePedido(pedido: PedidoApi): Pedido {
  return {
    id: pedido.id,
    fechaEntrada: pedido.fechaEntrada,
    centro: pedido.centro,
    material: pedido.material,
    fechaVencimiento: pedido.fechaVencimiento,
    estado: pedido.estado,
    incidencias: pedido.incidencias ?? '',
    transporte: pedido.transporte,
    moduloFabricacion: mapFaseToModulo('Fabricación', findFase(pedido.fases, 'Fabricación')),
    moduloCristal: mapFaseToModulo('Cristal', findFase(pedido.fases, 'Cristal')),
    moduloPersianas: mapFaseToModulo('Persianas', findFase(pedido.fases, 'Persianas')),
    moduloTransporte: mapFaseToModulo('Transporte', findFase(pedido.fases, 'Transporte')),
  };
}

function serializePedido(pedido: Pedido): PedidoApi {
  const fases = [
    mapModuloToFase('Fabricación', pedido.moduloFabricacion),
    mapModuloToFase('Cristal', pedido.moduloCristal),
    mapModuloToFase('Persianas', pedido.moduloPersianas),
    mapModuloToFase('Transporte', pedido.moduloTransporte),
  ].filter((fase): fase is FaseApi => fase !== null);

  return {
    id: pedido.id,
    fechaEntrada: pedido.fechaEntrada,
    centro: pedido.centro,
    material: pedido.material,
    fechaVencimiento: pedido.fechaVencimiento,
    estado: pedido.estado,
    incidencias: pedido.incidencias || null,
    transporte: pedido.transporte,
    fases,
  };
}

export async function fetchPedidos(): Promise<Pedido[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/pedidos`);
  const result = await handleResponse<{ pedidos: PedidoApi[] }>(response);
  return result.pedidos.map(normalizePedido);
}

export async function fetchPedidoById(id: string): Promise<Pedido> {
  const response = await fetchWithAuth(`${API_BASE_URL}/pedidos/${id}`);
  const pedido = await handleResponse<PedidoApi>(response);
  return normalizePedido(pedido);
}

export async function createPedido(pedido: Pedido): Promise<Pedido> {
  const response = await fetchWithAuth(`${API_BASE_URL}/pedidos`, {
    method: 'POST',
    body: JSON.stringify(serializePedido(pedido)),
  });
  const created = await handleResponse<PedidoApi>(response);
  return normalizePedido(created);
}

export async function updatePedido(pedido: Pedido): Promise<Pedido> {
  const response = await fetchWithAuth(`${API_BASE_URL}/pedidos/${pedido.id}`, {
    method: 'PUT',
    body: JSON.stringify(serializePedido(pedido)),
  });
  const updated = await handleResponse<PedidoApi>(response);
  return normalizePedido(updated);
}
