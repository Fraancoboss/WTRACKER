import { Pedido } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  return response.json() as Promise<T>;
}

export async function fetchPedidos(): Promise<Pedido[]> {
  const response = await fetch(`${API_BASE_URL}/pedidos`);
  return handleResponse<Pedido[]>(response);
}

export async function createPedido(pedido: Pedido): Promise<Pedido> {
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pedido),
  });
  return handleResponse<Pedido>(response);
}

export async function updatePedido(pedido: Pedido): Promise<Pedido> {
  const response = await fetch(`${API_BASE_URL}/pedidos/${pedido.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pedido),
  });
  return handleResponse<Pedido>(response);
}
