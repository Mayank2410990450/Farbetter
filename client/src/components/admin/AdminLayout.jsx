import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-muted/10">
      <div className="md:flex">
        <AdminSidebar />
        <div className="flex-1 min-h-screen">
          <AdminHeader />
          <main className="p-6 md:ml-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
