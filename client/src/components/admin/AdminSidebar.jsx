import { NavLink } from 'react-router-dom';
import { Home, Box, Layers, Plus, FileText, Settings } from 'lucide-react';

export default function AdminSidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/20'}`;

  return (
    <aside className="w-64 bg-background border-r min-h-screen hidden md:block">
      <div className="p-4">
        <div className="font-serif text-lg font-bold text-primary mb-6">Admin</div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/admin" className={linkClass} end>
            <Home className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            <Box className="h-4 w-4" />
            Products
          </NavLink>
          <NavLink to="/admin/products/new" className={linkClass}>
            <Plus className="h-4 w-4" />
            New Product
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            <Layers className="h-4 w-4" />
            Categories
          </NavLink>
          <NavLink to="/admin/logs" className={linkClass}>
            <FileText className="h-4 w-4" />
            Order Logs
          </NavLink>
          <NavLink to="/admin/settings" className={linkClass}>
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
