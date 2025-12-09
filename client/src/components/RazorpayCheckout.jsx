import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function RazorpayCheckout({ amount, onSuccess, onError, selectedAddressId }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to proceed with payment', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const orderResponse = await fetch(`${serverUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: user._id,
            email: user.email,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Step 2: Load Razorpay checkout script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Farbetter',
          description: 'Healthy Snacks E-commerce',
          order_id: orderData.orderId,
          handler: handlePaymentSuccess,
          prefill: {
            name: user.name || '',
            email: user.email || '',
          },
          theme: {
            color: '#3b82f6',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Step 3: Verify payment signature

      
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const verifyResponse = await fetch(`${serverUrl}/api/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          selectedAddressId,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your order has been placed successfully',
          variant: 'success',
        });
        if (onSuccess) onSuccess(response);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Payment could not be verified',
        variant: 'destructive',
      });
      if (onError) onError(error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || amount <= 0}
      className="w-full bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      {isLoading ? 'Processing...' : `Pay ₹${amount.toFixed(2)} with Razorpay`}
    </Button>
  );
}
