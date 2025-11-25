import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { PanelGeneral } from './components/PanelGeneral';
import { DetallePedido } from './components/DetallePedido';
import { PerfilUsuario } from './components/PerfilUsuario';
import { Pedido, Usuario } from './types';
import { createPedido, fetchPedidos, updatePedido as updatePedidoApi } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState('inicio');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPedidos = async () => {
    setIsLoadingPedidos(true);
    setLoadError(null);
    try {
      const data = await fetchPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos', error);
      setLoadError('No se pudieron cargar los pedidos. Revisa la API y la conexión con la base de datos.');
    } finally {
      setIsLoadingPedidos(false);
    }
  };

  useEffect(() => {
    void loadPedidos();
  }, []);

  const handleAddPedido = async (nuevoPedido: Pedido) => {
    try {
      const pedidoCreado = await createPedido(nuevoPedido);
      setPedidos((prev) => [...prev, pedidoCreado]);
      setActionError(null);
    } catch (error) {
      console.error('Error al crear pedido', error);
      setActionError('No se pudo crear el pedido. Inténtalo de nuevo.');
    }
  };

  const handleUpdatePedido = async (pedidoActualizado: Pedido) => {
    try {
      const pedidoGuardado = await updatePedidoApi(pedidoActualizado);
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoGuardado.id ? pedidoGuardado : p))
      );
      setActionError(null);
    } catch (error) {
      console.error('Error al actualizar pedido', error);
      setActionError('No se pudo actualizar el pedido. Inténtalo de nuevo.');
    }
  };

  const handleLogin = (usuarioData: Usuario) => {
    setUsuario(usuarioData);
    setCurrentView('inicio');
  };

  const handleLogout = () => {
    setUsuario(null);
    setCurrentView('inicio');
  };

  // Mostrar login si no hay usuario autenticado
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoadingPedidos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
        <p className="text-red-600 max-w-md">{loadError}</p>
        <div className="flex gap-3">
          <button
            onClick={() => void loadPedidos()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Reintentar
          </button>
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />
      
      <div className="ml-64 flex-1">
        {actionError && (
          <div className="mx-8 mt-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-700 underline hover:text-red-900"
            >
              Cerrar
            </button>
          </div>
        )}

        {currentView === 'inicio' && (
          <PanelGeneral
            pedidos={pedidos}
            usuario={usuario}
            onAddPedido={handleAddPedido}
            onUpdatePedido={handleUpdatePedido}
          />
        )}
        
        {currentView === 'pedidos' && (
          <DetallePedido
            pedidos={pedidos}
            usuario={usuario}
            onUpdatePedido={handleUpdatePedido}
          />
        )}
        
        {currentView === 'usuarios' && (
          <PerfilUsuario usuario={usuario} />
        )}
      </div>
    </div>
  );
}

export default App;
