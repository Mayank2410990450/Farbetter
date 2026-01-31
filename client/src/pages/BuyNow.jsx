import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchProduct } from '@/api/product';
import { fetchAddresses, addAddress } from '@/api/address';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/api/payment';
import { validateCoupon } from "@/api/coupon";
import { placeOrder } from '@/api/order';
import { fetchShippingSettings } from '@/api/admin';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SkeletonCheckout } from '@/components/Skeleton';
import { MapPin, Plus, ChevronRight, Package, CreditCard, Check, Tag, Loader2, X } from 'lucide-react';

export default function BuyNow() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    // Get product details from URL params
    const productId = searchParams.get('productId');
    const quantity = parseInt(searchParams.get('quantity') || '1');

    // State
    const [step, setStep] = useState(1);  // 1: Address, 2: Payment
    const [product, setProduct] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Shipping & Calculation State
    const [shippingSettings, setShippingSettings] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);

    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);

    // Address form
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: ''
    });

    // Check user auth
    useEffect(() => {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please login to buy this product',
                variant: 'destructive'
            });
            navigate(`/login?redirect=/buy-now?productId=${productId}&quantity=${quantity}`);
        }
    }, [user, navigate]);

    // Load product, addresses, and shipping settings
    useEffect(() => {
        if (!productId || !user) return;

        const loadData = async () => {
            try {
                setLoading(true);
                // Load product
                const prodRes = await fetchProduct(productId);
                const prod = prodRes.data || prodRes.product || prodRes;
                setProduct(prod);

                // Load shipping settings
                const shippingRes = await fetchShippingSettings();
                setShippingSettings(shippingRes?.settings || null);

                // Load saved addresses
                const addrs = await fetchAddresses();
                setAddresses(addrs || []);

                // Filter valid addresses
                const validAddrs = (addrs || []).filter(a => a.street && a.city && a.phone);

                // Auto-select first valid address if available
                if (validAddrs.length > 0) {
                    setSelectedAddress(validAddrs[0]._id);
                } else {
                    // If we have addresses but none are valid (empty/incomplete), show form
                    setShowAddressForm(true);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load details',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [productId, user]);

    // Handle add new address
    const handleAddAddress = async (e) => {
        e.preventDefault();

        try {
            setProcessing(true);
            const response = await addAddress(addressForm);
            const newAddr = response.address || response;
            setAddresses([...(addresses || []), newAddr]);
            setSelectedAddress(newAddr._id);
            setShowAddressForm(false);
            setAddressForm({
                fullName: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'India',
                phone: ''
            });
            toast({
                title: 'Success',
                description: 'Address added successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to add address',
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    // Calculate totals
    const initialTotal = product ? product.price * quantity : 0;

    // Update shipping cost whenever total or settings change
    useEffect(() => {
        if (shippingSettings) {
            if (shippingSettings.freeShippingThreshold && initialTotal >= shippingSettings.freeShippingThreshold) {
                setShippingCost(0);
            } else {
                setShippingCost(shippingSettings.shippingCost || 0);
            }
        }
    }, [initialTotal, shippingSettings]);

    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = Math.max(0, initialTotal + shippingCost - discount);

    // Coupon logic
    useEffect(() => {
        if (appliedCoupon && initialTotal < appliedCoupon.minPurchase) {
            setAppliedCoupon(null);
            setCouponError(`Coupon removed: Minimum purchase of ₹${appliedCoupon.minPurchase} required`);
            toast({ title: "Coupon Removed", description: "Minimum purchase requirement not met", variant: "destructive" });
        }
    }, [initialTotal, appliedCoupon]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError(null);
        try {
            const res = await validateCoupon(couponCode, initialTotal);
            if (res.isValid) {
                setAppliedCoupon({
                    code: res.couponCode,
                    discountAmount: res.discountAmount,
                    minPurchase: res.minPurchase
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

    // Handle continue to payment
    const handleContinueToPayment = () => {
        if (!selectedAddress) {
            toast({
                title: 'Address Required',
                description: 'Please select a delivery address',
                variant: 'destructive'
            });
            return;
        }
        setStep(2);
    };

    // Handle Razorpay payment
    const handlePayment = async () => {
        if (!product || !selectedAddress) return;

        try {
            setProcessing(true);

            // Create Razorpay order with DISCOUNTED amount + SHIPPING
            const orderData = await createRazorpayOrder({
                amount: finalTotal, // Send the final discounted amount
                productName: product.name || product.title,
                selectedAddressId: selectedAddress,
                productId: product._id || product.id,
                quantity: quantity,
                couponCode: appliedCoupon?.code,
                discountAmount: appliedCoupon?.discountAmount,
                shippingCost: shippingCost
            });

            // Ensure Razorpay SDK is loaded
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }

            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'Farbetter',
                description: `Purchase of ${product.name || product.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            dbOrderId: orderData.dbOrderId
                        });

                        toast({
                            title: 'Order Placed Successfully!',
                            description: `Order ID: ${orderData.dbOrderId.slice(-8)}`,
                            duration: 5000
                        });

                        // Navigate to order success page
                        navigate(`/user/orders/${orderData.dbOrderId}`);

                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        toast({
                            title: 'Payment Failed',
                            description: error.response?.data?.message || 'Something went wrong',
                            variant: 'destructive'
                        });
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: addressForm.phone || user.phone || ''
                },
                theme: {
                    color: '#F97316'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        toast({
                            title: 'Payment Cancelled',
                            description: 'You cancelled the payment',
                            variant: 'default'
                        });
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to initiate payment',
                variant: 'destructive'
            });
            setProcessing(false);
        }
    };

    if (loading || !product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="container mx-auto px-4 py-8 flex-1">
                    <SkeletonCheckout />
                </div>
                <Footer />
            </div>
        );
    }

    const selectedAddr = addresses?.find(a => a._id === selectedAddress);
    // Filter useful addresses for display
    const validAddresses = addresses?.filter(a => a.street && a.city && a.phone) || [];

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Header />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4 md:gap-8">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                                </div>
                                <span className={`text-sm font-medium hidden md:block ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Address</span>
                            </div>
                            <div className={`h-0.5 w-12 md:w-24 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    2
                                </div>
                                <span className={`text-sm font-medium hidden md:block ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Payment</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Step 1: Address Selection */}
                            {step === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Delivery Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Address List - Only show valid addresses */}
                                        {!showAddressForm && validAddresses.length > 0 && (
                                            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                                                {validAddresses.map((addr) => (
                                                    <Label
                                                        key={addr._id}
                                                        htmlFor={addr._id}
                                                        className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                                    >
                                                        <RadioGroupItem value={addr._id} id={addr._id} className="mt-1" />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{addr.fullName}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                                                        </div>
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        )}

                                        {/* If no valid addresses but we are not showing form, show message */}
                                        {!showAddressForm && validAddresses.length === 0 && addresses.length > 0 && (
                                            <div className="text-center py-4 text-muted-foreground">
                                                Please add a valid delivery address.
                                            </div>
                                        )}

                                        {/* Add New Address Button */}
                                        {!showAddressForm && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAddressForm(true)}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add New Address
                                            </Button>
                                        )}

                                        {/* Address Form */}
                                        {showAddressForm && (
                                            <form onSubmit={handleAddAddress} className="space-y-4 border-t pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <Label htmlFor="fullName">Full Name</Label>
                                                        <Input
                                                            id="fullName"
                                                            value={addressForm.fullName}
                                                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label htmlFor="street">Street Address</Label>
                                                        <Input
                                                            id="street"
                                                            value={addressForm.street}
                                                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                            placeholder="House no., Building name, Street"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={addressForm.city}
                                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                            placeholder="City"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="state">State</Label>
                                                        <Input
                                                            id="state"
                                                            value={addressForm.state}
                                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                            placeholder="State"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="postalCode">Postal Code</Label>
                                                        <Input
                                                            id="postalCode"
                                                            value={addressForm.postalCode}
                                                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                            placeholder="Pincode"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="phone">Phone Number</Label>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={addressForm.phone}
                                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                            placeholder="10-digit mobile number"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button type="submit" disabled={processing} className="flex-1">
                                                        {processing ? 'Saving...' : 'Save & Deliver Here'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setShowAddressForm(false)}
                                                        disabled={processing}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Continue Button */}
                                        {!showAddressForm && selectedAddress && (
                                            <Button onClick={handleContinueToPayment} className="w-full" size="lg">
                                                Continue to Payment
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Payment */}
                            {step === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Payment Method
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Selected Address Summary */}
                                        {selectedAddr && (
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium mb-1">Delivering to:</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedAddr.fullName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedAddr.street}, {selectedAddr.city}, {selectedAddr.state} {selectedAddr.postalCode}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-1">Phone: {selectedAddr.phone}</p>
                                                    </div>
                                                    <Button variant="link" onClick={() => setStep(1)} size="sm">
                                                        Change
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <Separator />

                                        {/* Payment Options */}
                                        <div className="space-y-4">
                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium">Pay with Razorpay</p>
                                                        <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking, Wallets</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Place Order Button */}
                                        <Button
                                            onClick={handlePayment}
                                            disabled={processing}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {processing ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Product Details */}
                                    <div className="flex gap-3">
                                        <div className="w-20 h-20 rounded border bg-white overflow-hidden shrink-0">
                                            <img
                                                src={product.images?.[0] || product.image}
                                                alt={product.name || product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-clamp-2">{product.name || product.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Qty: {quantity}</p>
                                            <p className="text-sm font-bold mt-1">₹{product.price.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Price Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                                            <span>₹{initialTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Delivery</span>
                                            <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
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

                                    {/* Shipping Info */}
                                    {shippingCost === 0 && shippingSettings?.freeShippingThreshold && (
                                        <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                                            ✓ {shippingSettings?.description || "Free shipping applied"}
                                        </div>
                                    )}
                                    {shippingCost > 0 && shippingSettings?.freeShippingThreshold && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                                            Add ₹{(shippingSettings.freeShippingThreshold - initialTotal).toFixed(0)} more for free shipping
                                        </div>
                                    )}

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

                                    <Separator />

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl">₹{finalTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Trust Badge */}
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Package className="w-4 h-4 text-green-600" />
                                            <span>Safe and secure payments</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
