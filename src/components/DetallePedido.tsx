import { useState } from 'react';
import { Search, Package, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pedido, Usuario, ModuloDetalle, Modulo } from '../types';
import { ModuloProceso } from './ModuloProceso';
import { Badge } from './ui/badge';
import { EditarPedidoDialog } from './EditarPedidoDialog';
import { fetchPedidoById } from '../lib/api';
import { useToast } from './ui/use-toast';
import { formatDate } from '../lib/formatDate';

const glassPanelClass = 'panel-card';

interface DetallePedidoProps {
  usuario: Usuario;
  onUpdatePedido: (pedido: Pedido) => Promise<Pedido>;
}

export function DetallePedido({ usuario, onUpdatePedido }: DetallePedidoProps) {
  const [pedidoId, setPedidoId] = useState('');
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const { toast } = useToast();

  // Verificar si el usuario puede editar pedidos (Admin u Oficina)
  const puedeEditarPedido = usuario.rol === 'Admin' || usuario.rol === 'Oficina';

  const buscarPedido = async () => {
    if (!pedidoId.trim()) return;

    setBuscando(true);
    setBusquedaRealizada(true);

    try {
      const pedido = await fetchPedidoById(pedidoId.trim());
      setPedidoActual(pedido);
    } catch (error) {
      console.error(error);
      setPedidoActual(null);
      toast({
        variant: 'destructive',
        title: 'Pedido no encontrado',
        description: 'Revisa el ID e inténtalo nuevamente.',
      });
    } finally {
      setBuscando(false);
    }
  };

  const handleBuscar = () => {
    void buscarPedido();
  };

  const handleUpdateModulo = async (tipo: Modulo, datos: ModuloDetalle) => {
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
        pedidoActualizado.moduloTransporte = datos;
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

    try {
      const pedidoGuardado = await onUpdatePedido(pedidoActualizado);
      setPedidoActual(pedidoGuardado);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGuardarEdicion = async (pedidoEditado: Pedido) => {
    try {
      const pedidoGuardado = await onUpdatePedido(pedidoEditado);
      setPedidoActual(pedidoGuardado);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="detalle">
      <div className={`${glassPanelClass} detalle__hero`}>
        <div className="detalle__header">
          <div>
            <p className="detalle__eyebrow">Detalle</p>
            <h1 className="detalle__title">Consulta de pedidos</h1>
          </div>
        </div>

        <div className="detalle__search">
          <div className="detalle__search-pill">
            <div className="detalle__search-icon">
              <Search className="w-4 h-4" />
            </div>
            <Input
              placeholder="Escribe el ID del pedido (ej: PED-2025-001)"
              value={pedidoId}
              onChange={(e) => setPedidoId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBuscar();
                }
              }}
              className="detalle__search-input"
            />
          </div>
          <Button
            onClick={handleBuscar}
            variant="blue"
            className="detalle__search-button"
            disabled={buscando}
          >
            <Search className="w-4 h-4" />
            {buscando ? 'Buscando...' : 'Buscar pedido'}
          </Button>
        </div>
      </div>

      {buscando ? (
        <div className={`${glassPanelClass} detalle__card detalle__empty`}>
          <p>Buscando pedido...</p>
        </div>
      ) : pedidoActual ? (
        <div className="detalle__stack">
          <div className={`${glassPanelClass} detalle__card`}>
            <div className="detalle__current">
              <div>
                <p className="detalle__current-label">Pedido actual</p>
                <div className="detalle__code-row">
                  <h2 className="detalle__code">{pedidoActual.id}</h2>
                  {puedeEditarPedido && (
                    <Button
                      onClick={() => setEditarDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="detalle__edit-button"
                    >
                      <Edit className="w-4 h-4" />
                      Editar pedido
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="detalle__info-grid">
              <InfoPair label="Centro" value={pedidoActual.centro} />
              <InfoPair label="Material" value={<Badge variant="outline">{pedidoActual.material}</Badge>} />
              <InfoPair label="Estado" value={<Badge>{pedidoActual.estado}</Badge>} />
              <InfoPair label="Transporte" value={<Badge variant={pedidoActual.transporte ? 'default' : 'outline'}>{pedidoActual.transporte ? 'Sí' : 'No'}</Badge>} />
              <InfoPair label="Fecha de entrada" value={formatDate(pedidoActual.fechaEntrada)} />
              <InfoPair label="Fecha de vencimiento" value={formatDate(pedidoActual.fechaVencimiento)} />
              <InfoPair label="Incidencias" value={pedidoActual.incidencias || '-'} fullWidth />
            </div>
          </div>

          <div className="detalle__modules">
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
      ) : pedidoId && busquedaRealizada ? (
        <EmptyState mensaje={`No se encontró ningún pedido con el ID ${pedidoId}`} />
      ) : (
        <EmptyState mensaje="Introduce un ID y presiona buscar." />
      )}

      {pedidoActual && (
        <EditarPedidoDialog
          open={editarDialogOpen}
          onOpenChange={setEditarDialogOpen}
          pedido={pedidoActual}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </div>
  );
}

function InfoPair({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`info-pair ${fullWidth ? 'info-pair--wide' : ''}`}>
      <p className="info-pair__label">{label}</p>
      <div className="info-pair__value">{value}</div>
    </div>
  );
}

function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className={`${glassPanelClass} empty-state`}>
      <Package className="empty-state__icon" />
      <p>{mensaje}</p>
    </div>
  );
}
