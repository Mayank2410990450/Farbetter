import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchProduct } from "@/api/product";
import { fetchAddresses } from "@/api/address";

export default function ShoppingCartComponent() {
  const { items = [], updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  const { user } = useAuth();

  // Load default address on mount
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const addresses = await fetchAddresses();
        const addrs = Array.isArray(addresses) ? addresses : addresses?.addresses || [];
        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) {
          setDefaultAddressId(defaultAddr._id);
        } else if (addrs.length > 0) {
          setDefaultAddressId(addrs[0]._id);
        }
      } catch (err) {
        console.error('Failed to load default address:', err);
      }
    };

    if (user) loadDefaultAddress();
  }, [user]);

  // Local state for enriched display items (for guest we fetch product details)
  const [displayItems, setDisplayItems] = useState(safeItems);

  useEffect(() => {
    let cancelled = false;

    const enrichGuestItems = async () => {
      if (user || !safeItems.length) {
        setDisplayItems(safeItems);
        return;
      }

      // Determine which items need fetching (missing name/price)
      const toFetch = safeItems.filter((it) => !it.name || !it.price || it.price === 0).map((it) => it.id ?? it._id);
      if (!toFetch.length) {
        setDisplayItems(safeItems);
        return;
      }

      try {
        const fetched = await Promise.all(
          toFetch.map((id) => fetchProduct(id).catch(() => null))
        );

        const fetchedMap = fetched.reduce((acc, p) => {
          if (p && (p._id || p.id)) acc[p._id ?? p.id] = p;
          return acc;
        }, {});

        const enriched = safeItems.map((it) => {
          const pid = it.id ?? it._id;
          const prod = fetchedMap[pid];
          if (prod) {
            return {
              ...it,
              name: prod.title || prod.name || it.name,
              image: prod.image || (prod.images && prod.images[0]) || it.image,
              price: Number(prod.price ?? it.price ?? 0),
            };
          }
          return it;
        });

        if (!cancelled) setDisplayItems(enriched);
      } catch (err) {
        if (!cancelled) setDisplayItems(safeItems);
      }
    };

    enrichGuestItems();

    return () => {
      cancelled = true;
    };
  }, [safeItems, user]);

  // Choose source of truth for pricing: use enriched displayItems for guests when available
  const sourceItems = (displayItems && displayItems.length) ? displayItems : safeItems;

  // Calculate subtotal safely from sourceItems
  const subtotal = sourceItems.reduce(
    (sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
    0
  );

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleUpdate = async (id, qty) => {
    if (qty < 1) return;
    setUpdatingId(id);
    await updateQuantity(id, qty);
    setUpdatingId(null);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {safeItems.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {safeItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart ({safeItems.length})
          </SheetTitle>
          <SheetDescription className="sr-only">
            View and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>

        {safeItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add some products to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Guest notice */}
            {(!user && safeItems.length > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-3 text-sm text-yellow-800">
                These items are currently stored locally on this device. They'll be merged into your account when you log in or register.
              </div>
            )}
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {(displayItems || safeItems).map((item) => {
                const itemId = item.id ?? item._id ?? Math.random(); // fallback unique key
                return (
                  <div key={itemId} className="flex gap-4">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name || "Product"}
                      loading="lazy"
                      className="w-20 h-20 object-cover rounded-md bg-muted"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {item.name || "Unknown"}
                          </h4>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeItem(item.id ?? item._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Quantity Controls */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={updatingId === itemId}
                          onClick={() =>
                            handleUpdate(item.id ?? item._id, (item.quantity || 0) - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity || 1}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={updatingId === itemId}
                          onClick={() =>
                            handleUpdate(item.id ?? item._id, (item.quantity || 0) + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-4">
              <Button className="w-full" onClick={() => navigate("/checkout")}>
                Proceed to Checkout →
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
