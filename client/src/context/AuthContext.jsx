import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  getProfile,
  logoutUser,
} from "../api/auth";
import { addToCart } from "@/api/cart";
import { addToWishlist } from "@/api/wishlist";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [authLoading, setAuthLoading] = useState(false); 
  const [error, setError] = useState(null);
  const { toast } = useToast();

useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");


    if (!token) {

      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getProfile();
      setUser(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ AuthContext: Profile fetch failed:", err.message);
      setUser(null);
      localStorage.removeItem("token");
      setLoading(false);
    }
  };

  // Listen for token updates from OAuth redirect
  const handleTokenUpdate = () => {
    const tokenCheck = localStorage.getItem("authToken");
    fetchProfile();
  };

  // Initial fetch on mount

  fetchProfile();
  
  // Listen for custom token-updated event (OAuth redirect)
  window.addEventListener('token-updated', handleTokenUpdate);
  
  // Also listen for storage changes (other tabs)
  const handleStorageChange = (e) => {
    if (e.key === 'token' && e.newValue) {
      fetchProfile();
    }
  };
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('token-updated', handleTokenUpdate);
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);


  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      const res = await loginUser({ email, password });

      // Merge guest cart into server cart if present (deduplicate + sum quantities)
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        if (guest && guest.length) {
          // aggregate quantities by productId to avoid duplicate API calls
          const agg = guest.reduce((acc, it) => {
            const id = it.productId;
            const qty = Number(it.quantity || 1);
            acc[id] = (acc[id] || 0) + qty;
            return acc;
          }, {});

          await Promise.all(
            Object.entries(agg).map(([productId, quantity]) =>
              addToCart(productId, quantity)
            )
          );

          // clear guest cart after merging
          localStorage.removeItem("guest_cart");
          // Inform the user the merge completed
          toast({ title: "Cart merged", description: "Your guest cart items were merged into your account.", variant: "success" });
          // Also merge guest wishlist if present
          try {
            const rawWishlist = localStorage.getItem("guest_wishlist");
            const wishlistIds = rawWishlist ? JSON.parse(rawWishlist) : [];
            if (wishlistIds && wishlistIds.length) {
              // dedupe
              const unique = Array.from(new Set(wishlistIds));
              await Promise.all(unique.map((pid) => addToWishlist(pid).catch(() => null)));
              localStorage.removeItem("guest_wishlist");
              toast({ title: "Wishlist merged", description: "Your saved wishlist items were merged into your account.", variant: "success" });
            }
          } catch (e) {
            console.warn("Guest wishlist merge failed:", e);
          }
        }
      } catch (e) {
        // ignore merge errors
        console.warn("Guest cart merge failed:", e);
      }

      const profile = await getProfile();

      setUser(profile);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    // Admin login is the same as regular login, but we check the role after
    try {
      setAuthLoading(true);
      setError(null);

      const res = await loginUser({ email, password });
      const profile = await getProfile();

      // Check if user is admin
      if (!profile || profile.role !== 'admin') {
        const errMsg = 'You do not have admin privileges';
        setError(errMsg);
        setUser(null);
        logoutUser().catch(() => null);
        throw new Error(errMsg);
      }

      setUser(profile);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Login failed";
      setError(errMsg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setAuthLoading(true);
      setError(null);

      await registerUser({ name, email, password });

      // After registration, merge guest cart into server cart if any (dedupe)
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        if (guest && guest.length) {
          const agg = guest.reduce((acc, it) => {
            const id = it.productId;
            const qty = Number(it.quantity || 1);
            acc[id] = (acc[id] || 0) + qty;
            return acc;
          }, {});

          await Promise.all(
            Object.entries(agg).map(([productId, quantity]) =>
              addToCart(productId, quantity)
            )
          );

          localStorage.removeItem("guest_cart");
        }
      } catch (e) {
        console.warn("Guest cart merge failed after register:", e);
      }
      // Merge guest wishlist after register
      try {
        const rawWishlist = localStorage.getItem("guest_wishlist");
        const wishlistIds = rawWishlist ? JSON.parse(rawWishlist) : [];
        if (wishlistIds && wishlistIds.length) {
          const unique = Array.from(new Set(wishlistIds));
          await Promise.all(unique.map((pid) => addToWishlist(pid).catch(() => null)));
          localStorage.removeItem("guest_wishlist");
          toast({ title: "Wishlist merged", description: "Your saved wishlist items were merged into your account.", variant: "success" });
        }
      } catch (e) {
        console.warn("Guest wishlist merge failed after register:", e);
      }

      const profile = await getProfile();
      setUser(profile);

      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authLoading,
        error,
        login,
        logout,
        register,
        adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
