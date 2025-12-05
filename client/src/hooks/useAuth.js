import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider. Context is undefined.");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { user, login, adminLogin, register, logout, loading } = context;

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    register,
    logout,
    isLoggingIn: loading, // Simplify for now
  };
}
