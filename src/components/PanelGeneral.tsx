import { useState } from 'react';
import { Plus, Search, Edit, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Pedido, Usuario } from '../types';
import { NuevoPedidoDialog } from './NuevoPedidoDialog';
import { EditarPedidoDialog } from './EditarPedidoDialog';

interface PanelGeneralProps {
  pedidos: Pedido[];
  usuario: Usuario;
  onAddPedido: (pedido: Pedido) => void;
  onUpdatePedido: (pedido: Pedido) => void;
}

export function PanelGeneral({ pedidos, usuario, onAddPedido, onUpdatePedido }: PanelGeneralProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState<Pedido | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canAddPedidos = ['Oficina', 'Admin'].includes(usuario.rol);
  const canEditPedidos = ['Oficina', 'Admin'].includes(usuario.rol);

  const handleEditarPedido = (pedido: Pedido) => {
    setPedidoAEditar(pedido);
    setEditarDialogOpen(true);
  };

  const handleGuardarEdicion = (pedidoEditado: Pedido) => {
    onUpdatePedido(pedidoEditado);
  };

  const filteredPedidos = pedidos.filter((pedido) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      pedido.id.toLowerCase().includes(term) ||
      pedido.centro.toLowerCase().includes(term) ||
      pedido.estado.toLowerCase().includes(term)
    );
  });

  const getEstadoBadge = (estado: Pedido['estado']) => {
    const variants: Record<Pedido['estado'], { bg: string; text: string }> = {
      'Listo': { bg: 'bg-green-100 text-green-800 border-green-300', text: '🟢 Listo' },
      'En curso': { bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: '🟡 En curso' },
      'Detenido': { bg: 'bg-red-100 text-red-800 border-red-300', text: '🔴 Detenido' },
      'No iniciado': { bg: 'bg-gray-100 text-gray-800 border-gray-300', text: '⚪ No iniciado' },
    };
    
    const style = variants[estado];
    return (
      <Badge className={`${style.bg} border`}>
        {style.text}
      </Badge>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900 mb-1">WTRACKER – Seguimiento de Fabricación</h1>
            <p className="text-gray-600">Panel General de Pedidos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-gray-900">{usuario.nombre}</p>
              <p className="text-gray-600">{usuario.rol}</p>
            </div>
            <div className="w-10 h-10 bg-[#007BFF] rounded-full flex items-center justify-center text-white">
              {usuario.nombre.charAt(0)}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por ID, centro o estado..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canAddPedidos && (
            <Button onClick={() => setDialogOpen(true)} className="bg-[#007BFF] hover:bg-[#0056b3]">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo pedido
            </Button>
          )}
        </div>
      </div>

      {/* Pedidos Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">🆔 ID Pedido</th>
                <th className="px-6 py-3 text-left text-gray-700">🕓 Registro de entrada</th>
                <th className="px-6 py-3 text-left text-gray-700">🏢 Centro</th>
                <th className="px-6 py-3 text-left text-gray-700">⚙️ Material</th>
                <th className="px-6 py-3 text-left text-gray-700">📅 Fecha de vencimiento</th>
                <th className="px-6 py-3 text-left text-gray-700">🔖 Estado</th>
                <th className="px-6 py-3 text-left text-gray-700">💬 Incidencias</th>
                <th className="px-6 py-3 text-left text-gray-700">🚚 Transporte</th>
                {canEditPedidos && (
                  <th className="px-6 py-3 text-left text-gray-700">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{pedido.id}</td>
                  <td className="px-6 py-4 text-gray-600">{pedido.fechaEntrada}</td>
                  <td className="px-6 py-4 text-gray-900">{pedido.centro}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{pedido.material}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pedido.fechaVencimiento}</td>
                  <td className="px-6 py-4">
                    {getEstadoBadge(pedido.estado)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {pedido.incidencias || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={pedido.transporte ? 'default' : 'outline'}>
                      {pedido.transporte ? 'Sí' : 'No'}
                    </Badge>
                  </td>
                  {canEditPedidos && (
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarPedido(pedido)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
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
