import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Package, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pedido, Usuario } from '../types';
import { NuevoPedidoDialog } from './NuevoPedidoDialog';
import { EditarPedidoDialog } from './EditarPedidoDialog';
import { formatDate } from '../lib/formatDate';

const glassPanelClass = 'panel-card';

interface PanelGeneralProps {
  pedidos: Pedido[];
  usuario: Usuario;
  onAddPedido: (pedido: Pedido) => Promise<void> | void;
  onUpdatePedido: (pedido: Pedido) => Promise<Pedido>;
}

export function PanelGeneral({ pedidos, usuario, onAddPedido, onUpdatePedido }: PanelGeneralProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState<Pedido | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const canAddPedidos = ['Oficina', 'Admin'].includes(usuario.rol);
  const canEditPedidos = ['Oficina', 'Admin'].includes(usuario.rol);

  const handleEditarPedido = (pedido: Pedido) => {
    setPedidoAEditar(pedido);
    setEditarDialogOpen(true);
  };

  const handleGuardarEdicion = async (pedidoEditado: Pedido) => {
    await onUpdatePedido(pedidoEditado);
  };

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        pedido.id.toLowerCase().includes(term) ||
        pedido.centro.toLowerCase().includes(term) ||
        pedido.estado.toLowerCase().includes(term)
      );
    });
  }, [pedidos, searchTerm]);

  const orderedPedidos = useMemo(() => {
    const sorted = [...filteredPedidos].sort((a, b) => {
      const dateA = new Date(a.fechaEntrada).getTime();
      const dateB = new Date(b.fechaEntrada).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [filteredPedidos, sortOrder]);

  const resumenEstados = useMemo(() => {
    const total = pedidos.length || 1;
    const estados: Array<{ label: string; value: number; cardClass: string; chipClass: string }> = [
      { label: 'Listo', value: pedidos.filter((p) => p.estado === 'Listo').length, cardClass: 'kpi-card--green', chipClass: 'kpi-chip--green' },
      { label: 'En curso', value: pedidos.filter((p) => p.estado === 'En curso').length, cardClass: 'kpi-card--amber', chipClass: 'kpi-chip--amber' },
      { label: 'Detenido', value: pedidos.filter((p) => p.estado === 'Detenido').length, cardClass: 'kpi-card--red', chipClass: 'kpi-chip--red' },
      { label: 'No iniciado', value: pedidos.filter((p) => p.estado === 'No iniciado').length, cardClass: 'kpi-card--slate', chipClass: 'kpi-chip--slate' },
    ];
    return estados.map((estado) => ({
      ...estado,
      percentage: Math.round((estado.value / total) * 100),
    }));
  }, [pedidos]);

  const getEstadoBadge = (estado: Pedido['estado']) => {
    return <span className={`status-chip status-chip--${estado.replace(' ', '').toLowerCase()}`}>{estado}</span>;
  };

  const handleCopyId = async (pedidoId: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API no disponible');
      return;
    }
    try {
      await navigator.clipboard.writeText(pedidoId);
      setCopiedId(pedidoId);
      window.setTimeout(() => {
        setCopiedId((current) => (current === pedidoId ? null : current));
      }, 1600);
    } catch (error) {
      console.error('No se pudo copiar el ID', error);
    }
  };

  return (
    <div className="main-panel">
      <div className={`${glassPanelClass} hero-panel`}>
        <div className="hero-panel__header">
          <div>
            <p className="hero-panel__eyebrow">Operaciones</p>
            <h2 className="hero-panel__title">Seguimiento integral</h2>
            <p className="hero-panel__subtitle">Gestiona pedidos y estados desde un único lugar, con filtros rápidos y acciones claras.</p>
          </div>
          {canAddPedidos && (
            <Button
              onClick={() => setDialogOpen(true)}
              variant="blue"
              className="hero-panel__cta"
            >
              <Plus className="w-4 h-4" />
              Nuevo pedido
            </Button>
          )}
        </div>

        <div className="hero-panel__tools">
          <div className="search-pill">
            <div className="search-pill__icon">
              <Search className="w-4 h-4" />
            </div>
            <Input
              placeholder="Buscar por ID, centro o estado..."
              className="search-pill__input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-filter">
            <label htmlFor="order" className="table-filter__label">Ordenar</label>
            <select
              id="order"
              className="table-filter__select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            >
              <option value="desc">Fecha descendente</option>
              <option value="asc">Fecha ascendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="kpi-grid">
        {resumenEstados.map((item) => (
          <div
            key={item.label}
            className={`kpi-card ${item.cardClass}`}
          >
            <div className="kpi-card__header">
              <p className="kpi-card__label">{item.label}</p>
              <span className={`kpi-chip ${item.chipClass}`}>
                {item.percentage}%
              </span>
            </div>
            <div className="kpi-card__value">
              <span className="kpi-card__value-number">{item.value}</span>
              <span className="kpi-card__value-caption">Pedidos</span>
            </div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar" style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos Table */}
      <div className={`${glassPanelClass} table-card table-wrapper`}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Registro</th>
                <th>Centro</th>
                <th>Material</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Incidencias</th>
                <th>Transporte</th>
                {canEditPedidos && (
                  <th>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orderedPedidos.map((pedido) => (
                <tr key={pedido.id} className="table-row">
                  <td>
                    <div className="table-id">
                      <span>{pedido.id}</span>
                      <button
                        type="button"
                        className={`copy-button ${copiedId === pedido.id ? 'copy-button--active' : ''}`}
                        onClick={() => handleCopyId(pedido.id)}
                        aria-label="Copiar ID del pedido"
                      >
                        <Copy className="copy-button__icon" />
                      </button>
                    </div>
                  </td>
                  <td>{formatDate(pedido.fechaEntrada)}</td>
                  <td>{pedido.centro}</td>
                  <td>
                    <span className="pill pill--muted">
                      {pedido.material}
                    </span>
                  </td>
                  <td>{formatDate(pedido.fechaVencimiento)}</td>
                  <td>{getEstadoBadge(pedido.estado)}</td>
                  <td className="truncate">{pedido.incidencias || '-'}</td>
                  <td>
                    <span className={`pill ${pedido.transporte ? 'pill--active' : 'pill--muted'}`}>
                      {pedido.transporte ? 'Programado' : 'Pendiente'}
                    </span>
                  </td>
                  {canEditPedidos && (
                    <td>
                      <button
                        type="button"
                        className="table-edit"
                        onClick={() => handleEditarPedido(pedido)}
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orderedPedidos.length === 0 && (
          <div className="empty-state">
            <Package className="empty-state__icon" />
            <p>No se encontraron pedidos</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NuevoPedidoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGuardar={onAddPedido}
      />

      {pedidoAEditar && (
        <EditarPedidoDialog
          open={editarDialogOpen}
          onOpenChange={setEditarDialogOpen}
          pedido={pedidoAEditar}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </div>
  );
}
