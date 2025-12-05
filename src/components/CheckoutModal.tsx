import { useState } from "react";
import PayPalCardCheckout from "../payments/PayPalCardCheckout";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  currency?: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  bookingId,
  totalAmount,
  currency = "USD",
}: CheckoutModalProps) {
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuccess = (details: any) => {
    setPaymentSuccess(details);
    setPaymentError(null);
  };

  const handleError = (err: string) => {
    setPaymentError(err);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>

        <p className="text-gray-700 mb-4">
          Secure card payment powered by PayPal.
        </p>

        {paymentSuccess ? (
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-semibold text-green-700">Payment Successful!</h3>
            <p>Your booking has been confirmed.</p>
          </div>
        ) : (
          <>
            {paymentError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
                {paymentError}
              </div>
            )}

            <PayPalCardCheckout
              bookingId={bookingId}
              amount={totalAmount}
              currency={currency}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-300 hover:bg-gray-400 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
