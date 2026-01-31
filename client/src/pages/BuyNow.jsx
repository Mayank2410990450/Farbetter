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
import { placeOrder } from '@/api/order';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SkeletonCheckout } from '@/components/Skeleton';
import { MapPin, Plus, ChevronRight, Package, CreditCard, Check } from 'lucide-react';

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

    // Load product and addresses
    useEffect(() => {
        if (!productId || !user) return;

        const loadData = async () => {
            try {
                setLoading(true);
                // Load product
                const prodRes = await fetchProduct(productId);
                const prod = prodRes.data || prodRes.product || prodRes;
                setProduct(prod);

                // Load saved addresses
                const addrs = await fetchAddresses();
                setAddresses(addrs || []);

                // Auto-select first address if available
                if (addrs && addrs.length > 0) {
                    setSelectedAddress(addrs[0]._id);
                } else {
                    setShowAddressForm(true);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load product details',
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
            const newAddr = await addAddress(addressForm);
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

            const totalPrice = product.price * quantity;

            // Create Razorpay order
            const orderData = await createRazorpayOrder({
                amount: totalPrice,
                productName: product.name || product.title,
                selectedAddressId: selectedAddress,
                productId: product._id || product.id,
                quantity: quantity
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

    const totalPrice = product.price * quantity;
    const selectedAddr = addresses?.find(a => a._id === selectedAddress);

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
                                        {/* Address List */}
                                        {!showAddressForm && addresses && addresses.length > 0 && (
                                            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                                                {addresses.map((addr) => (
                                                    <Label
                                                        key={addr._id}
                                                        htmlFor={addr._id}
                                                        className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                                    >
                                                        <RadioGroupItem value={addr._id} id={addr._id} className="mt-1" />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{addr.phone}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                                            </p>
                                                        </div>
                                                    </Label>
                                                ))}
                                            </RadioGroup>
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
                                            {processing ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
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
                                            <span>₹{(product.price * quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Delivery</span>
                                            <span className="text-green-600 font-medium">FREE</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl">₹{totalPrice.toFixed(2)}</span>
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
