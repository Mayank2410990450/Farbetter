import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { fetchAddresses } from "@/api/address";
import { placeOrder } from "@/api/order";
import { fetchShippingSettings } from "@/api/admin";
import { Heart, Trash2, Truck, Lock, MapPin, Tag, Loader2, X } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils";
import { validateCoupon } from "@/api/coupon";
import { Input } from "@/components/ui/input";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, clearCart } = useCart();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingSettings, setShippingSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load addresses and shipping settings
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch shipping settings
        const shippingRes = await fetchShippingSettings();
        setShippingSettings(shippingRes?.settings || null);

        // Fetch addresses
        const res = await fetchAddresses();
        const addrs = Array.isArray(res) ? res : res.addresses || [];
        setAddresses(addrs);

        // Auto-select default address
        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (addrs.length > 0) {
          setSelectedAddressId(addrs[0]._id);
        }
      } catch (err) {
        console.error("Error loading checkout data:", err);
        toast({
          title: "Error",
          description: "Failed to load checkout data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, toast]);

  // Calculate shipping based on settings
  useEffect(() => {
    if (!shippingSettings) return;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Check if free shipping threshold is met
    if (shippingSettings.freeShippingThreshold && subtotal >= shippingSettings.freeShippingThreshold) {
      setShippingCost(0);
    } else {
      setShippingCost(shippingSettings.shippingCost || 0);
    }

    // If COD is disabled and currently selected, switch to Razorpay or another method
    if (shippingSettings.codEnabled === false && paymentMethod === "COD") {
      setPaymentMethod("Razorpay");
    }
  }, [items, shippingSettings, paymentMethod]);

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </Card>
      </div>
    );
  }

  // Calculate total
  // Calculate total
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  // Clear coupon if cart becomes empty or subtotal drops below requirement (could be enhanced with useEffect check)
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minPurchase) {
      setAppliedCoupon(null);
      setCouponError(`Coupon removed: Minimum purchase of ₹${appliedCoupon.minPurchase} required`);
      toast({ title: "Coupon Removed", description: "Minimum purchase requirement not met", variant: "destructive" });
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.isValid) {
        setAppliedCoupon({
          code: res.couponCode,
          discountAmount: res.discountAmount,
          minPurchase: res.minPurchase // ensure backend returns this if needed for re-validation
        });
        toast({ title: "Success", description: `Coupon ${res.couponCode} applied!` });
        setCouponCode("");
      }
    } catch (error) {
      console.error(error);
      setCouponError(error.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    toast({ title: "Removed", description: "Coupon removed" });
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // For now, implement COD and mock Stripe/Razorpay
      if (paymentMethod === "Stripe") {
        // TODO: Integrate Stripe
        toast({
          title: "Info",
          description: "Stripe integration coming soon",
          variant: "default",
        });
        return;
      }

      if (paymentMethod === "Razorpay") {
        // Razorpay flow: create razorpay order -> open checkout -> verify -> create DB order
        try {
          const { createRazorpayOrder, verifyRazorpayPayment } = await import('@/api/payment');

          // create razorpay order on server (send amount from cart total)
          const orderResp = await createRazorpayOrder({
            amount: total,
            selectedAddressId,
            shippingCost,
            couponCode: appliedCoupon?.code
          });
          if (!orderResp?.orderId) throw new Error('Failed to create razorpay order');

          // ensure Razorpay SDK loaded
          if (!window.Razorpay) {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = 'https://checkout.razorpay.com/v1/checkout.js';
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
          }

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || window.__RAZORPAY_KEY_ID__,
            amount: Math.round(total * 100),
            currency: 'INR',
            order_id: orderResp.orderId,
            handler: async function (response) {
              try {
                // verify payment using the dbOrderId we got earlier
                const verify = await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  dbOrderId: orderResp.dbOrderId // pass the MongoDB Order ID
                });
                if (!verify?.success) throw new Error(verify?.message || 'Verification failed');

                toast({ title: 'Success', description: 'Payment successful! Redirecting...' });
                clearCart();
                navigate(`/order-confirmation/${verify.orderId}`);
              } catch (err) {
                console.error('Payment verification error:', err);
                // Even if frontend verification fails now, the Webhook should eventually fix it
                // But we show error to user
                toast({ title: 'Order Verification Error', description: 'Please check your orders page.', variant: 'destructive' });
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
            },
            theme: { color: '#F97316' },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } catch (err) {
          console.error('Payment initialization error:', err);
          toast({ title: 'Error', description: err?.message || 'Razorpay failed', variant: 'destructive' });
          return;
        }
      }

      // Place order (COD or after payment)
      const orderRes = await placeOrder({
        selectedAddressId,
        paymentMethod,
        paymentMethod,
        paymentId: null,
        shippingCost,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount || 0,
      });

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      clearCart();
      navigate(`/order-confirmation/${orderRes.order._id}`);
    } catch (err) {
      console.error("Error placing order:", err);
      const errorMsg =
        err?.response?.data?.message || "Failed to place order";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h2 className="text-xl font-bold">Delivery Address</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No addresses found
                </p>
                <Button onClick={() => navigate("/user/dashboard")}>
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedAddressId === addr._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                      }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}, {addr.city}, {addr.state}{" "}
                        {addr.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.country} • {addr.phone}
                      </p>
                      {addr.isDefault && (
                        <Badge variant="outline" className="mt-2">
                          Default
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <img
                    src={getOptimizedImageUrl(item.image, 100)}
                    alt={item.name}
                    loading="lazy"
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* COD */}
              {shippingSettings?.codEnabled !== false && (
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <p className="font-semibold">Cash on Delivery (COD)</p>
                    <p className="text-sm text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
              )}

              {/* Razorpay */}
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <input
                  type="radio"
                  name="payment"
                  value="Razorpay"
                  checked={paymentMethod === "Razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <p className="font-semibold">Razorpay</p>
                  <p className="text-sm text-muted-foreground">
                    UPI, Cards, and more
                  </p>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shippingCost === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium animate-in fade-in slide-in-from-right-4">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon Input */}
            <div className="pt-2 pb-2">
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-9 uppercase"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button size="sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  <span className="font-semibold">{appliedCoupon.code} applied</span>
                  <button onClick={removeCoupon} className="text-green-700 hover:text-green-900"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {shippingCost === 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                ✓ {shippingSettings?.description || "Free shipping on this order"}
              </div>
            )}

            {shippingSettings?.freeShippingThreshold && shippingCost > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                Add ₹{(shippingSettings.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddress}
            >
              {processing ? "Processing..." : "Place Order"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/shop")}
              disabled={processing}
            >
              Continue Shopping
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Your payment is secure and encrypted</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
