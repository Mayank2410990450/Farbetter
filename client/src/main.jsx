import ReactDOM from "react-dom/client";
import "./index.css";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { OrdersProvider } from "./context/OrdersContext.jsx";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

import { HelmetProvider } from 'react-helmet-async';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <OrdersProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </OrdersProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);
