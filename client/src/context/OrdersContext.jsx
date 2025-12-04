import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getMyOrders, placeOrder } from "@/api/order";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load orders from backend
  const loadOrders = async () => {
    // Only fetch if user is logged in
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getMyOrders();
      // API returns orders array or nested in data.orders
      const ordersList = Array.isArray(data) ? data : data?.orders ?? [];
      setOrders(ordersList);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    }
    setLoading(false);
  };

  // Create order
  const createOrder = async (selectedAddressId, paymentMethod = "COD") => {
    setLoading(true);
    try {
      const data = await placeOrder(selectedAddressId, paymentMethod);
      await loadOrders();
      return data;
    } catch (err) {
      console.error("Error placing order:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load when user logs in
  useEffect(() => {
    loadOrders();
  }, [user]);

  return (
    <OrdersContext.Provider value={{ orders, loading, createOrder, loadOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
