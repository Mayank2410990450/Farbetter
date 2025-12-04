import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/api/wishlist";
import { fetchProductById } from "@/api/product";
import { useToast } from "@/hooks/use-toast";

const WishlistContext = createContext();

// Normalize wishlist item to UI format
const normalize = (product) => ({
  id: product._id ?? product.id,
  name: product.title ?? product.name ?? "",
  image: product.image ?? (product.images && product.images[0]) ?? "",
  price: Number(product.price ?? 0),
});

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch wishlist from backend
  const loadWishlist = async () => {
    setLoading(true);
    try {
      // If user is logged in, fetch from server
      if (user) {
        const data = await fetchWishlist();
        const products = data?.wishlist?.products ?? data?.products ?? [];
        const normalized = products.map(normalize);
        setWishlist(normalized);
      } else {
        // Load guest wishlist from localStorage (array of productIds)
        const raw = localStorage.getItem("guest_wishlist");
        const ids = raw ? JSON.parse(raw) : [];
        if (!ids || !ids.length) {
          setWishlist([]);
        } else {
          // Prefetch minimal metadata for display
          const fetched = await Promise.all(
            ids.map(async (id) => {
              try {
                const p = await fetchProductById(id);
                const prod = p?.data || p?.product || p;
                return normalize(prod);
              } catch (e) {
                return { id, name: "", image: "", price: 0 };
              }
            })
          );
          setWishlist(fetched.filter(Boolean));
        }
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Add to wishlist
  const add = async (productId) => {
    // If not logged in, persist to guest wishlist in localStorage
    if (!user) {
      const raw = localStorage.getItem("guest_wishlist");
      const ids = raw ? JSON.parse(raw) : [];
      if (!ids.includes(productId)) ids.push(productId);
      localStorage.setItem("guest_wishlist", JSON.stringify(ids));

      // Try to prefetch product to show in UI
      try {
        const p = await fetchProductById(productId);
        const prod = p?.data || p?.product || p;
        setWishlist((prev) => {
          if (prev.some((p) => p.id === (prod._id || prod.id))) return prev;
          return [...prev, normalize(prod)];
        });
      } catch (e) {
        setWishlist((prev) => {
          if (prev.some((p) => p.id === productId)) return prev;
          return [...prev, { id: productId, name: "", image: "", price: 0 }];
        });
      }

      toast({ title: "Saved", description: "Added to your wishlist (saved locally). It will be available after you log in.", variant: "default" });
      return;
    }

    // Authenticated flow: optimistic update then reconcile with server
    setWishlist((prev) => {
      if (prev.some((p) => p.id === productId)) return prev;
      return [...prev, { id: productId, name: "", image: "", price: 0 }];
    });

    try {
      const data = await addToWishlist(productId);
      const products = data?.wishlist?.products ?? data?.products ?? [];
      const normalized = products.map(normalize);
      setWishlist(normalized);
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      // rollback
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Remove from wishlist
  const remove = async (productId) => {
    // Guest flow: remove from localStorage
    if (!user) {
      const raw = localStorage.getItem("guest_wishlist");
      const ids = raw ? JSON.parse(raw) : [];
      const filtered = ids.filter((id) => id !== productId);
      localStorage.setItem("guest_wishlist", JSON.stringify(filtered));
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
      toast({ title: "Removed", description: "Removed from local wishlist", variant: "default" });
      return;
    }

    // Authenticated flow: optimistic remove then reconcile
    const previous = wishlist;
    setWishlist((prev) => prev.filter((p) => p.id !== productId));

    try {
      const data = await removeFromWishlist(productId);
      const products = data?.wishlist?.products ?? data?.products ?? [];
      const normalized = products.map(normalize);
      setWishlist(normalized);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      // rollback
      setWishlist(previous);
    }
  };

  // Load when user logs in
  useEffect(() => {
    loadWishlist();
  }, [user]);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, add, remove, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
