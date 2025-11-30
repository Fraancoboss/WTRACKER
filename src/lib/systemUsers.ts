import { RolUsuario } from '../types';

export interface SystemUserRecord {
  id: string;
  nombre: string;
  rol: RolUsuario;
  password: string;
}

const STORAGE_KEY = 'systemUsersOverrides';

const DEFAULT_SYSTEM_USERS: SystemUserRecord[] = [
  { id: '1', nombre: 'admin', rol: 'Admin', password: 'admin123' },
  { id: '2', nombre: 'maria.lopez', rol: 'Oficina', password: 'oficina123' },
  { id: '3', nombre: 'carlos.perez', rol: 'Fabricación', password: 'fab123' },
  { id: '4', nombre: 'marcos.lopez', rol: 'Fabricación', password: 'fab123' },
  { id: '5', nombre: 'pedro.diaz', rol: 'Cristal', password: 'cristal123' },
  { id: '6', nombre: 'maria.gonzalez', rol: 'Cristal', password: 'cristal123' },
  { id: '7', nombre: 'luis.ramos', rol: 'Persianas', password: 'persianas123' },
  { id: '8', nombre: 'juan.martinez', rol: 'Persianas', password: 'persianas123' },
  { id: '9', nombre: 'raul.perez', rol: 'Transporte', password: 'trans123' },
  { id: '10', nombre: 'ana.garcia', rol: 'Visualización', password: 'visual123' },
];

function getOverrides(): Record<string, SystemUserRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('No se pudieron cargar los usuarios del sistema', error);
    return {};
  }
}

function saveOverrides(overrides: Record<string, SystemUserRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getSystemUsers(): SystemUserRecord[] {
  const overrides = getOverrides();
  const merged = DEFAULT_SYSTEM_USERS.map((user) => {
    const override = overrides[user.id];
    return override ? { ...user, ...override } : user;
  });

  const overrideOnly = Object.values(overrides).filter(
    (record) => !DEFAULT_SYSTEM_USERS.some((user) => user.id === record.id)
  );

  return [...merged, ...overrideOnly];
}

export function upsertSystemUser(record: SystemUserRecord) {
  const overrides = getOverrides();
  overrides[record.id] = record;
  saveOverrides(overrides);
}

export function getUserPasswordById(id: string): string {
  const overrides = getOverrides();
  if (overrides[id]?.password) {
    return overrides[id].password;
  }
  const base = DEFAULT_SYSTEM_USERS.find((user) => user.id === id);
  return base?.password ?? '';
}
