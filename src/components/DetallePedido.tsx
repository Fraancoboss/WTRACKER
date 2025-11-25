import { useState } from 'react';
import { Search, Package, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pedido, Usuario, ModuloDetalle, ModuloTransporteDetalle } from '../types';
import { ModuloProceso } from './ModuloProceso';
import { Badge } from './ui/badge';
import { EditarPedidoDialog } from './EditarPedidoDialog';

interface DetallePedidoProps {
  pedidos: Pedido[];
  usuario: Usuario;
  onUpdatePedido: (pedido: Pedido) => void;
}

export function DetallePedido({ pedidos, usuario, onUpdatePedido }: DetallePedidoProps) {
  const [pedidoId, setPedidoId] = useState('');
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);

  // Verificar si el usuario puede editar pedidos (Admin u Oficina)
  const puedeEditarPedido = usuario.rol === 'Admin' || usuario.rol === 'Oficina';

  const handleBuscar = () => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    setPedidoActual(pedido || null);
  };

  const handleUpdateModulo = (tipo: string, datos: ModuloDetalle | ModuloTransporteDetalle) => {
    if (!pedidoActual) return;

    const pedidoActualizado = { ...pedidoActual };

    switch (tipo) {
      case 'Fabricación':
        pedidoActualizado.moduloFabricacion = datos as ModuloDetalle;
        break;
      case 'Cristal':
        pedidoActualizado.moduloCristal = datos as ModuloDetalle;
        break;
      case 'Persianas':
        pedidoActualizado.moduloPersianas = datos as ModuloDetalle;
        break;
      case 'Transporte':
        pedidoActualizado.moduloTransporte = datos as ModuloTransporteDetalle;
        break;
    }

    // Actualizar estado general del pedido según los módulos
    const modulos = [
      pedidoActualizado.moduloFabricacion,
      pedidoActualizado.moduloCristal,
      pedidoActualizado.moduloPersianas,
    ].filter(Boolean) as ModuloDetalle[];

    if (modulos.every((m) => m.estado === 'Completado')) {
      pedidoActualizado.estado = 'Listo';
    } else if (modulos.some((m) => m.estado === 'En proceso')) {
      pedidoActualizado.estado = 'En curso';
    } else if (modulos.some((m) => m.estado === 'Bloqueado')) {
      pedidoActualizado.estado = 'Detenido';
    } else {
      pedidoActualizado.estado = 'No iniciado';
    }

    setPedidoActual(pedidoActualizado);
    onUpdatePedido(pedidoActualizado);
  };

  const handleGuardarEdicion = (pedidoEditado: Pedido) => {
    setPedidoActual(pedidoEditado);
    onUpdatePedido(pedidoEditado);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-gray-900 mb-1">Detalle del Pedido</h1>
          <p className="text-gray-600 mb-6">Busca un pedido para ver y editar su información</p>

          {/* Search */}
          <div className="flex gap-3">
            <Input
              placeholder="Escribe el ID del pedido (ej: PED-2025-001)"
              value={pedidoId}
              onChange={(e) => setPedidoId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              className="flex-1"
            />
            <Button onClick={handleBuscar} className="bg-[#007BFF] hover:bg-[#0056b3]">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Resultado */}
        {pedidoActual ? (
          <div className="space-y-6">
            {/* Info del pedido */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900">Información del Pedido</h2>
                {puedeEditarPedido && (
                  <Button
                    onClick={() => setEditarDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Pedido
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">ID Pedido</p>
                  <p className="text-gray-900">{pedidoActual.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Centro</p>
                  <p className="text-gray-900">{pedidoActual.centro}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Material</p>
                  <Badge variant="outline">{pedidoActual.material}</Badge>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Estado General</p>
                  <Badge>{pedidoActual.estado}</Badge>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Fecha de Entrada</p>
                  <p className="text-gray-900">{pedidoActual.fechaEntrada}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Fecha de Vencimiento</p>
                  <p className="text-gray-900">{pedidoActual.fechaVencimiento}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Transporte</p>
                  <Badge variant={pedidoActual.transporte ? 'default' : 'outline'}>
                    {pedidoActual.transporte ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Incidencias</p>
                  <p className="text-gray-900">{pedidoActual.incidencias || '-'}</p>
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div className="grid md:grid-cols-2 gap-6">
              {pedidoActual.moduloFabricacion && (
                <ModuloProceso
                  tipo="Fabricación"
                  datos={pedidoActual.moduloFabricacion}
                  usuario={usuario}
                  onUpdate={(datos) => handleUpdateModulo('Fabricación', datos)}
                />
              )}

              {pedidoActual.moduloCristal && (
                <ModuloProceso
                  tipo="Cristal"
                  datos={pedidoActual.moduloCristal}
                  usuario={usuario}
                  onUpdate={(datos) => handleUpdateModulo('Cristal', datos)}
                />
              )}

              {pedidoActual.moduloPersianas && (
                <ModuloProceso
                  tipo="Persianas"
                  datos={pedidoActual.moduloPersianas}
                  usuario={usuario}
                  onUpdate={(datos) => handleUpdateModulo('Persianas', datos)}
                />
              )}

              {pedidoActual.moduloTransporte && (
                <ModuloProceso
                  tipo="Transporte"
                  datos={pedidoActual.moduloTransporte}
                  usuario={usuario}
                  onUpdate={(datos) => handleUpdateModulo('Transporte', datos)}
                />
              )}
            </div>
          </div>
        ) : pedidoId && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No se encontró ningún pedido con el ID: <strong>{pedidoId}</strong></p>
          </div>
        )}

        {/* Dialog de edición */}
        {pedidoActual && (
          <EditarPedidoDialog
            open={editarDialogOpen}
            onOpenChange={setEditarDialogOpen}
            pedido={pedidoActual}
            onGuardar={handleGuardarEdicion}
          />
        )}
      </div>
    </div>
  );
}
