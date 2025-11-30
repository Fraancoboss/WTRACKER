import { Home, Package, User, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ currentView, onNavigate, onLogout, isAdmin = false }: SidebarProps) {
  const menuItems = [
    { id: 'inicio', label: 'Panel Central', icon: Home },
    { id: 'pedidos', label: 'Detalle de pedido', icon: Package },
    { id: 'usuarios', label: 'Usuarios', icon: User, adminOnly: true },
  ].filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">W</div>
        <div className="sidebar__brand-copy">
          <p className="sidebar__brand-name">WTRACKER</p>
          <span className="sidebar__brand-subtitle">Suite Operativa</span>
        </div>
      </div>

      <div className="sidebar__divider" />

      <div className="sidebar__section">
        <p className="sidebar__section-label">Navegación</p>
        <nav className="sidebar__nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                }}
                className={`sidebar__nav-button ${isActive ? 'sidebar__nav-button--active' : ''}`}
              >
                <Icon className="sidebar__icon" />
                <div>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__footer">
        <p className="sidebar__footer-note">Sesión segura</p>
        <button
          onClick={onLogout}
          className="sidebar__logout"
        >
          <LogOut className="sidebar__icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
