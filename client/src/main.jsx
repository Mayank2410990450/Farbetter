import ReactDOM from "react-dom/client";
import "./index.css";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { OrdersProvider } from "./context/OrdersContext.jsx";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <OrdersProvider>
      <WishlistProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </WishlistProvider>
    </OrdersProvider>
  </AuthProvider>
);
