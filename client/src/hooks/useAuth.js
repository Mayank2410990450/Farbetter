import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const { user, login, adminLogin, logout, loading } = useAuthContext();

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    logout,
    isLoggingIn: loading, // Simplify for now
  };
}
