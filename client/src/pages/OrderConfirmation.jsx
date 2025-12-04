import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { fetchOrderById } from "@/api/order";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await fetchOrderById(orderId);
        setOrder(res.order || res);
      } catch (err) {
        console.error("Error loading order:", err);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) loadOrder();
  }, [orderId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </Card>
      </div>
    );
  }

  // Calculate totals from order data
  const subtotal = order.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) || 0;
  const shippingCost = order.shippingCost || 0;
  const total = order.totalAmount || subtotal + shippingCost;

  const statusSteps = [
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.key === order.orderStatus
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <BackButton />
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Thank you for your order. Your order number is{" "}
          <span className="font-bold text-primary">#{order._id?.slice(-8)}</span>
        </p>
        <p className="text-muted-foreground">
          A confirmation email has been sent to your inbox
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>

            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key}>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            isCurrent ? "text-primary" : isActive ? "" : ""
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isCurrent
                            ? "Current status"
                            : isActive
                            ? "Completed"
                            : "Pending"}
                        </p>
                      </div>
                    </div>

                    {index < statusSteps.length - 1 && (
                      <div className="ml-5 mt-2 mb-2 h-8 border-l-2 border-gray-200"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>

            {order.shippingAddress && (
              <div className="bg-muted p-4 rounded">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.country}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>

            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.product?.title || item.product?.name || "Product"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unit Price: ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            {/* Payment Status */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <p className="font-semibold text-blue-900">Payment Method</p>
              </div>
              <p className="text-sm text-blue-700">{order.paymentMethod}</p>
              <p className="text-xs text-blue-600 mt-1">
                Status:{" "}
                <span className="font-semibold">{order.paymentStatus}</span>
              </p>
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `₹${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Date */}
            <div className="bg-muted p-3 rounded text-sm">
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                onClick={() => navigate("/user/dashboard")}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Continue Shopping CTA */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-center">
        <h3 className="text-xl font-bold mb-4">Continue Shopping</h3>
        <p className="text-muted-foreground mb-6">
          Explore more of our healthy snack products
        </p>
        <Button onClick={() => navigate("/shop")} size="lg">
          Back to Shop
        </Button>
      </Card>
    </div>
  );
}
