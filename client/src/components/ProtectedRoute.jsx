import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login based on required role if possible, or just generic login
        if (role === 'admin') {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // Only enforce role check if the user's role is available
    if (role && user?.role && user.role !== role) {
        // If user is logged in but doesn't have the right role
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}
