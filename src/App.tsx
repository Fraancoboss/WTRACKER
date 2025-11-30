import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { PanelGeneral } from './components/PanelGeneral';
import { DetallePedido } from './components/DetallePedido';
import { PerfilUsuario } from './components/PerfilUsuario';
import { Pedido } from './types';
import { fetchPedidos, createPedido, updatePedido } from './lib/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import './styles/dashboard.css';

function AppContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('inicio');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadPedidos();
    }
  }, [isAuthenticated]);


  const loadPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPedidos();
      setPedidos(data);
    } catch (err) {
      setError('No se pudieron cargar los pedidos. Revisa la API y la conexión con la base de datos.');
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudieron cargar los pedidos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPedido = async (nuevoPedido: Pedido) => {
    try {
      const pedidoCreado = await createPedido(nuevoPedido);
      setPedidos((prev) => [pedidoCreado, ...prev]);
      toast({
        title: "Pedido creado",
        description: `El pedido ${pedidoCreado.id} ha sido creado exitosamente.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error al crear",
        description: "No se pudo crear el pedido.",
      });
      throw err;
    }
  };

  const handleUpdatePedido = async (pedidoActualizado: Pedido) => {
    try {
      const pedidoGuardado = await updatePedido(pedidoActualizado);
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoGuardado.id ? pedidoGuardado : p))
      );
      toast({
        title: "Pedido actualizado",
        description: `El pedido ${pedidoGuardado.id} ha sido actualizado.`,
      });
      return pedidoGuardado;
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudo actualizar el pedido.",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (currentView === 'usuarios' && user && user.rol !== 'Admin') {
      setCurrentView('inicio');
    }
  }, [currentView, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const viewCopy: Record<string, { title: string; subtitle: string }> = {
    inicio: {
      title: 'Panel Central',
      subtitle: 'Supervisa el estado general de cada fabricación',
    },
    pedidos: {
      title: 'Detalle del pedido',
      subtitle: 'Consulta fases y registra avances por módulo',
    },
    usuarios: {
      title: 'Usuarios',
      subtitle: 'Gestiona tu perfil y permisos asignados',
    },
  };

  const headerInfo = viewCopy[currentView] ?? viewCopy['inicio'];
  const canViewUsuarios = user?.rol === 'Admin';

  return (
    <div className="app-shell">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={logout}
        isAdmin={canViewUsuarios}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="app-header__identity">
            <div className="app-header__badge">
              <span>W</span>
            </div>
            <div>
              <p className="app-header__date">{new Date().toLocaleDateString()}</p>
              <h1 className="app-header__title">{headerInfo.title}</h1>
              <p className="app-header__subtitle">{headerInfo.subtitle}</p>
            </div>
          </div>
          {user && (
            <div className="app-header__user">
              <div>
                <p className="app-header__username">{user.nombre}</p>
                <p className="app-header__role">{user.rol}</p>
              </div>
              <div className="app-header__avatar">
                {user.nombre.charAt(0)}
              </div>
            </div>
          )}
        </header>

        <main className="app-content">
          <div className="dashboard-stack">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={loadPedidos}
                  className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div
                key={currentView}
                className="motion-safe:animate-[fade-slide_0.35s_ease_forwards] flex flex-col gap-8"
              >
                {currentView === 'inicio' && user && (
                  <PanelGeneral
                    pedidos={pedidos}
                    usuario={user}
                    onAddPedido={handleAddPedido}
                    onUpdatePedido={handleUpdatePedido}
                  />
                )}

                {currentView === 'pedidos' && user && (
                  <DetallePedido
                    usuario={user}
                    onUpdatePedido={handleUpdatePedido}
                  />
                )}

                {currentView === 'usuarios' && user && canViewUsuarios && (
                  <PerfilUsuario usuario={user} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
