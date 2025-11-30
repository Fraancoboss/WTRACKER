import { useEffect, useState } from 'react';
import { Wrench, Square as WindowIcon, Blinds, Truck, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Usuario, Modulo } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getSystemUsers, getUserPasswordById, SystemUserRecord } from '../lib/systemUsers';

interface PerfilUsuarioProps {
  usuario: Usuario;
}

export function PerfilUsuario({ usuario }: PerfilUsuarioProps) {
  const moduloConfig: Record<Modulo, { className: string; icon: React.ElementType; label: string }> = {
    'Fabricación': { className: 'profile-module--fabricacion', icon: Wrench, label: 'Fabricación' },
    'Cristal': { className: 'profile-module--cristal', icon: WindowIcon, label: 'Cristal' },
    'Persianas': { className: 'profile-module--persianas', icon: Blinds, label: 'Persianas' },
    'Transporte': { className: 'profile-module--transporte', icon: Truck, label: 'Transporte' },
  };

  const assignedModules = usuario.modulosAsignados ?? [];
  const canEditProfile = usuario.rol === 'Admin';
  const [editOpen, setEditOpen] = useState(false);
  const [systemUsers, setSystemUsers] = useState<SystemUserRecord[]>(() =>
    usuario.rol === 'Admin' ? getSystemUsers() : []
  );
  const [formValues, setFormValues] = useState({
    nombre: usuario.nombre,
    password: getUserPasswordById(String(usuario.id)),
  });
  useEffect(() => {
    setFormValues({
      nombre: usuario.nombre,
      password: getUserPasswordById(String(usuario.id)),
    });
    if (usuario.rol === 'Admin') {
      setSystemUsers(getSystemUsers());
    }
  }, [usuario]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateProfile({
      nombre: formValues.nombre,
      password: formValues.password,
    });
    if (usuario.rol === 'Admin') {
      setSystemUsers(getSystemUsers());
    }
    setEditOpen(false);
  };

  const initials = usuario.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const permissions: Array<{ title: string; description: string; condition?: boolean; warning?: boolean }> = [
    {
      title: 'Administrador total',
      description: 'Acceso completo a todos los módulos y configuración del sistema',
      condition: usuario.rol === 'Admin',
    },
    {
      title: 'Crear nuevos pedidos',
      description: 'Añade pedidos desde el Panel General y gestiona su ciclo',
      condition: usuario.rol === 'Admin' || usuario.rol === 'Oficina',
    },
    {
      title: 'Editar módulos asignados',
      description: 'Actualiza estado, fechas y observaciones de tus módulos',
      condition: assignedModules.length > 0,
    },
    {
      title: 'Ver Panel General',
      description: 'Consulta el estado global de la producción en tiempo real',
      condition: true,
    },
    {
      title: 'Solo lectura',
      description: 'Sin permisos para modificar pedidos ni módulos',
      condition: usuario.rol === 'Visualización',
      warning: true,
    },
  ];

  return (
    <div className="profile">
      <div className="profile__column">
        <section className="profile-card panel-card">
          <div className="profile-card__header">
            <div className="profile-avatar">{initials}</div>
            <div>
              <p className="profile-eyebrow">Usuario</p>
              <h2 className="profile-name">{usuario.nombre}</h2>
              <div className="profile-role">
                <Shield className="profile-role__icon" />
                <span>{usuario.rol}</span>
              </div>
              <p className="profile-id">ID: {usuario.id}</p>
            </div>
            {canEditProfile && (
              <Button variant="outline" size="sm" className="profile-edit">
                Editar perfil
              </Button>
            )}
          </div>

          {assignedModules.length > 0 && (
            <div className="profile-section">
              <p className="profile-section__label">Módulos asignados</p>
              <div className="profile-modules">
                {assignedModules.map((modulo) => {
                  const config = moduloConfig[modulo];
                  const Icon = config.icon;
                  return (
                    <div key={modulo} className={`profile-module ${config.className}`}>
                      <Icon className="profile-module__icon" />
                      <span>{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="profile-card panel-card profile-permissions">
          <p className="profile-section__label">Permisos del sistema</p>
          <div className="profile-permissions__list">
            {permissions
              .filter((item) => item.condition)
              .map((item) => (
                <div
                  key={item.title}
                  className={`profile-permission ${item.warning ? 'profile-permission--warning' : ''}`}
                >
                  <div className="profile-permission__icon">
                    {item.warning ? '!' : '✓'}
                  </div>
                  <div>
                    <p className="profile-permission__title">{item.title}</p>
                    <p className="profile-permission__text">{item.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {usuario.rol === 'Admin' && (
          <section className="profile-card panel-card profile-users">
            <p className="profile-section__label">Usuarios del sistema</p>
            <div className="profile-users__table">
              <div className="profile-users__row profile-users__row--head">
                <span>Nombre</span>
                <span>Rol</span>
                <span>Contraseña</span>
              </div>
              {systemUsers.map((user) => (
                <div key={user.id} className="profile-users__row">
                  <span>{user.nombre}</span>
                  <span className="profile-users__role">{user.rol}</span>
                  <span className="profile-users__password">{user.password}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="form-dialog">
          <DialogTitle>Editar perfil</DialogTitle>
          <form className="form-stack" onSubmit={handleProfileSubmit}>
            <div className="form-field">
              <label htmlFor="perfil-nombre" className="form-label">
                Usuario
              </label>
              <Input
                id="perfil-nombre"
                value={formValues.nombre}
                onChange={(e) => setFormValues((prev) => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="perfil-password" className="form-label">
                Contraseña
              </label>
              <Input
                id="perfil-password"
                type="text"
                value={formValues.password}
                onChange={(e) => setFormValues((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
