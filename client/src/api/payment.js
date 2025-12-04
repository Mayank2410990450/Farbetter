import api from './apiClient';

export const createRazorpayOrder = async (payload = {}) => {
  // payload should include amount
  const { data } = await api.post('/payments/create-order', payload);
  return data;
};

export const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, selectedAddressId }) => {
  // Send selectedAddressId so server can create the order with correct address
  const { data } = await api.post('/payments/verify-payment', { razorpay_order_id, razorpay_payment_id, razorpay_signature, selectedAddressId });
  return data;
};

export const getPaymentDetails = async (paymentId) => {
  const { data } = await api.get(`/payments/payment/${paymentId}`);
  return data;
};
