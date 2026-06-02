import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentPage = ({ internship, applicant, onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert("Payment gateway is still loading. Please try again in a few seconds.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on the backend
      const orderResponse = await axios.post('http://localhost:5001/api/payment/create-order', {
        name: applicant.full_name,
        email: applicant.email,
        phone: applicant.phone,
        domain: internship.title,
        amount: internship.price
      });

      const orderData = orderResponse.data;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key, // Dynamic key from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Mira Future Tech',
        description: `Application Fee for ${internship.title}`,
        image: 'https://mirafuturetechvision.com/logo.png', // Add your actual logo URL
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyResponse = await axios.post('http://localhost:5001/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.message === 'Payment verified successfully') {
              // 4. Update internship payment status
              await axios.post('http://localhost:5001/api/internships/payment-update', {
                email: applicant.email,
                transactionId: response.razorpay_payment_id,
                status: 'Completed'
              });
              onSuccess(); // Redirect to Success Screen
            }
          } catch (verifyError) {
            console.error('Payment Verification Failed', verifyError);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: applicant.full_name,
          email: applicant.email,
          contact: applicant.phone
        },
        theme: {
          color: '#2563EB' // Tailwind Blue-600
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();

    } catch (error) {
      console.error('Payment initiation failed', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
          <p className="text-slate-300 text-sm">You are applying for the {internship?.title} program.</p>
        </div>
        
        <div className="p-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Application Fee</span>
              <span className="font-semibold text-slate-900">₹{internship?.price}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm text-green-600">
              <span>Discount</span>
              <span>- ₹0</span>
            </div>
            <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-lg text-slate-900">
              <span>Total Amount</span>
              <span>₹{internship?.price}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Secured by Razorpay</h3>
            <p className="text-xs text-slate-500">
              Clicking the pay button will open a secure Razorpay checkout window where you can use UPI, Credit/Debit cards, or Net Banking.
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onBack}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors w-1/3"
            >
              Cancel
            </button>
            <button 
              onClick={handlePayment}
              disabled={loading || !scriptLoaded}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                (loading || !scriptLoaded)
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Processing...' : `Pay ₹${internship?.price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
