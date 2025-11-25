import { Wrench, Square as WindowIcon, Blinds, Truck, User, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Usuario, Modulo } from '../types';

interface PerfilUsuarioProps {
  usuario: Usuario;
}

export function PerfilUsuario({ usuario }: PerfilUsuarioProps) {
  const moduloConfig: Record<Modulo, { color: string; icon: any; label: string }> = {
    'Fabricación': { color: 'bg-blue-500', icon: Wrench, label: '🧱 Fabricación' },
    'Cristal': { color: 'bg-green-500', icon: WindowIcon, label: '🪟 Cristal' },
    'Persianas': { color: 'bg-orange-500', icon: Blinds, label: '🌀 Persianas' },
    'Transporte': { color: 'bg-red-500', icon: Truck, label: '🚚 Transporte' },
  };

  const canEditProfile = ['Admin', 'Oficina'].includes(usuario.rol);

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-900 mb-1">Perfil de Usuario</h1>
          <p className="text-gray-600">Información personal y permisos del sistema</p>
        </div>

        {/* User Info Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-[#007BFF] rounded-full flex items-center justify-center text-white text-4xl flex-shrink-0">
              {usuario.nombre.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">{usuario.nombre}</h2>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-[#007BFF] text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  {usuario.rol}
                </Badge>
                <span className="text-gray-600">ID: {usuario.id}</span>
              </div>
              {canEditProfile && (
                <Button variant="outline" size="sm">
                  Editar perfil
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-4">Módulos asignados</h3>
            
            {usuario.modulosAsignados.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {usuario.modulosAsignados.map((modulo) => {
                  const config = moduloConfig[modulo];
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={modulo}
                      className={`${config.color} text-white rounded-lg p-4 flex items-center gap-3`}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{config.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">
                  {usuario.rol === 'Visualización' 
                    ? 'Usuario de solo lectura - No tiene módulos asignados para edición'
                    : 'No tienes módulos específicos asignados'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Permissions Info */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Permisos del sistema</h3>
          <div className="space-y-3">
            {usuario.rol === 'Admin' && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-gray-900">Administrador Total</p>
                  <p className="text-gray-600 text-sm">
                    Acceso completo a todos los módulos, gestión de usuarios y configuración del sistema
                  </p>
                </div>
              </div>
            )}

            {usuario.rol === 'Oficina' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900">Crear nuevos pedidos</p>
                    <p className="text-gray-600 text-sm">
                      Puedes añadir nuevos pedidos al sistema desde el Panel General
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900">Ver todos los pedidos</p>
                    <p className="text-gray-600 text-sm">
                      Acceso de lectura a toda la información de pedidos y módulos
                    </p>
                  </div>
                </div>
              </>
            )}

            {usuario.modulosAsignados.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-gray-900">Editar módulos asignados</p>
                  <p className="text-gray-600 text-sm">
                    Puedes modificar el estado, fechas y observaciones de tus módulos asignados
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-gray-900">Ver Panel General</p>
                <p className="text-gray-600 text-sm">
                  Acceso al tablero principal con todos los pedidos del sistema
                </p>
              </div>
            </div>

            {usuario.rol === 'Visualización' && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-sm">!</span>
                </div>
                <div>
                  <p className="text-gray-900">Solo lectura</p>
                  <p className="text-gray-600 text-sm">
                    No puedes modificar información de pedidos ni módulos
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
