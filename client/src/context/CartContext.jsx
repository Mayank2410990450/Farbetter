// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCartItem,
  clearCart as apiClearCart,
} from "@/api/cart";
import { fetchProduct } from "@/api/product";

const CartContext = createContext();

// Normalize backend cart item to UI-ready format
const normalize = (item) => {
  const product = item.product ?? item.productId ?? item.productData ?? {};
  return {
    id: product._id ?? product.id ?? item._id ?? item.id,
    _id: product._id ?? item._id,
    name: product.title ?? product.name ?? item.name ?? "Unknown",
    image: product.image ?? (product.images && product.images[0]) ?? "",
    price: Number(product.price ?? item.price ?? 0),
    quantity: Number(item.quantity ?? item.qty ?? 1),
    size: item.size ?? product.size ?? "Default",
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = async () => {
    // If no user, load guest cart from localStorage
    if (!user) {
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        // Map guest entries to lightweight items
        const guestItems = guest.map((it) => ({
          id: it.productId,
          _id: it.productId,
          name: it.name || "Guest Item",
          image: it.image || "",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
        }));
        setItems(guestItems);
        setCart({ items: guestItems });
      } catch (err) {
        setItems([]);
        setCart({ items: [] });
      }
      return;
    }

    setLoading(true);
    try {
      const data = await getCart();
      const rawItems = data?.items ?? data?.cart?.items ?? [];
      const normalized = rawItems.map(normalize);
      setItems(normalized);
      setCart(data?.cart ?? data ?? { items: rawItems });
    } catch (err) {
      console.error("Error fetching cart:", err);
      setItems([]);
      setCart({ items: [] });
    }
    setLoading(false);
  };

  // Add to cart
  const add = async (productId, quantity = 1) => {
    // If guest, store in localStorage guest_cart
    if (!user) {
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        // Try to increment existing entry
        const idx = guest.findIndex((g) => g.productId === productId);
        if (idx > -1) {
          guest[idx].quantity = (guest[idx].quantity || 0) + quantity;
        } else {
          // Try to fetch product metadata to enrich guest cart entry
          const entry = { productId, quantity };
          try {
            const p = await fetchProduct(productId);
            entry.name = p?.title || p?.name || entry.name;
            entry.image = p?.image || (p?.images && p.images[0]) || entry.image;
            entry.price = Number(p?.price ?? entry.price ?? 0);
          } catch (e) {
            // ignore metadata fetch failures
          }
          guest.push(entry);
        }
        localStorage.setItem("guest_cart", JSON.stringify(guest));
        // Update local state representation
        const guestItems = guest.map((it) => ({ id: it.productId, _id: it.productId, name: it.name || "Guest Item", image: it.image || "", price: Number(it.price || it.price || 0), quantity: Number(it.quantity || 1) }));
        setItems(guestItems);
        setCart({ items: guestItems });
      } catch (err) {
        console.error("Error adding to guest cart:", err);
      }
      return;
    }
    try {
      const data = await addToCart(productId, quantity);

      const rawItems = data?.items ?? data?.cart?.items ?? [];
      const normalized = rawItems.map(normalize);
      setItems(normalized);
      setCart(data?.cart ?? data ?? { items: rawItems });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    // Guest mode: update localStorage
    if (!user) {
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        const idx = guest.findIndex((g) => g.productId === productId);
        if (idx > -1) {
          guest[idx].quantity = quantity;
          localStorage.setItem("guest_cart", JSON.stringify(guest));
        }
        const guestItems = guest.map((it) => ({ id: it.productId, _id: it.productId, name: it.name || "Guest Item", image: it.image || "", price: Number(it.price || 0), quantity: Number(it.quantity || 1) }));
        setItems(guestItems);
        setCart({ items: guestItems });
      } catch (err) {
        console.error("Error updating guest cart:", err);
      }
      return;
    }
    try {
      const data = await updateCartQuantity(productId, quantity);
      const rawItems = data?.items ?? data?.cart?.items ?? [];
      const normalized = rawItems.map(normalize);
      setItems(normalized);
      setCart(data?.cart ?? data ?? { items: rawItems });
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    if (!user) {
      try {
        const raw = localStorage.getItem("guest_cart");
        const guest = raw ? JSON.parse(raw) : [];
        const updated = guest.filter((g) => g.productId !== productId);
        localStorage.setItem("guest_cart", JSON.stringify(updated));
        const guestItems = updated.map((it) => ({ id: it.productId, _id: it.productId, name: it.name || "Guest Item", image: it.image || "", price: Number(it.price || 0), quantity: Number(it.quantity || 1) }));
        setItems(guestItems);
        setCart({ items: guestItems });
      } catch (err) {
        console.error("Error removing guest cart item:", err);
      }
      return;
    }
    try {
      const data = await removeCartItem(productId);
      const rawItems = data?.items ?? data?.cart?.items ?? [];
      const normalized = rawItems.map(normalize);
      setItems(normalized);
      setCart(data?.cart ?? data ?? { items: rawItems });
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      try {
        localStorage.removeItem("guest_cart");
        setItems([]);
        setCart({ items: [] });
      } catch (err) {
        console.error("Error clearing guest cart:", err);
      }
      return;
    }
    try {
      await apiClearCart();
      setItems([]);
      setCart({ items: [] });
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  // Fetch cart when user logs in
  useEffect(() => {
    fetchCart();
  }, [user]);


  return (
    <CartContext.Provider
      value={{
        items,
        cart,
        loading,
        add,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
