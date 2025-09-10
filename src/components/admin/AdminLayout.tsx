import AdminBadge from '@/components/admin/AdminBadge';
import { NavLink } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div>
      <header className="flex items-center justify-between p-3 border-b border-border bg-card">
        <nav className="flex gap-3 text-sm">
          <NavLink 
            to="/admin" 
            className={({ isActive }) => 
              `hover:underline ${isActive ? 'text-primary font-medium' : 'text-foreground'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/auto-covers" 
            className={({ isActive }) => 
              `hover:underline ${isActive ? 'text-primary font-medium' : 'text-foreground'}`
            }
          >
            Auto-covers
          </NavLink>
          <NavLink 
            to="/admin/audit" 
            className={({ isActive }) => 
              `hover:underline ${isActive ? 'text-primary font-medium' : 'text-foreground'}`
            }
          >
            Audit
          </NavLink>
        </nav>
        <AdminBadge />
      </header>
      <main>{children}</main>
    </div>
  );
}