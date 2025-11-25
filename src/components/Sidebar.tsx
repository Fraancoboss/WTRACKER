import { Home, Package, User, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'inicio', label: 'Panel Central', icon: Home },
    { id: 'pedidos', label: 'Detalle de pedido', icon: Package },
    { id: 'usuarios', label: 'Usuarios', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#2C3E50] h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="w-12 h-12 bg-[#007BFF] rounded-lg flex items-center justify-center mb-2">
          <span className="text-white text-2xl">W</span>
        </div>
        <h1 className="text-white mt-2">WTRACKER</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-[#007BFF] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
