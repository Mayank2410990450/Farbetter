import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-serif text-lg font-bold text-primary">Farbetter Admin</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Admin logout">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
