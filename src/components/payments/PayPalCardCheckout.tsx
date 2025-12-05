import { useEffect, useRef, useState } from "react";
import {
  loadScript,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";

interface PayPalCardCheckoutProps {
  amount: number;
  currency?: string;
  bookingId: string;
  onSuccess: (details: any) => void;
  onError: (err: any) => void;
}

const createOrderBackend = async (bookingId: string, amount: number, currency: string) => {
  const res = await fetch("/api/payments/create-paypal-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, amount, currency }),
  });
  return res.json();
};

const captureOrderBackend = async (orderId: string) => {
  const res = await fetch("/api/payments/capture-paypal-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  return res.json();
};

function SubmitCardButton({
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
}: PayPalCardCheckoutProps) {
  const { cardFields } = usePayPalHostedFields();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!cardFields) {
      onError("Hosted Fields not loaded");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create order on your server
      const order = await createOrderBackend(bookingId, amount, currency);
      if (!order?.id) throw new Error("Order creation failed");

      // 2️⃣ Submit Hosted Fields
      const cardResult = await cardFields.submit({
        contingencies: ["3D_SECURE"],
      });

      if (!cardResult?.orderId) throw new Error("Card submission failed");

      // 3️⃣ Capture payment on backend
      const capture = await captureOrderBackend(order.id);

      if (capture?.status !== "COMPLETED") {
        throw new Error("Payment not completed");
      }

      onSuccess(capture);
    } catch (err: any) {
      onError(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleClick}
      className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
      }`}
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}

export default function PayPalCardCheckout({
  amount,
  currency = "USD",
  bookingId,
  onSuccess,
  onError,
}: PayPalCardCheckoutProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadScript({
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID!,
      components: "hosted-fields",
      intent: "capture",
    }).then(() => setReady(true));
  }, []);

  if (!ready) return <div>Loading payment form...</div>;

  return (
    <PayPalHostedFieldsProvider
      createOrder={() =>
        createOrderBackend(bookingId, amount, currency).then((r) => r.id)
      }
    >
      <div className="space-y-4">
        {/* Card Number */}
        <PayPalHostedField
          id="card-number-field"
          hostedFieldType="number"
          options={{ selector: "#card-number", placeholder: "Card Number" }}
        />
        <div id="card-number" className="border rounded p-3 w-full"></div>

        {/* Expiration Date */}
        <PayPalHostedField
          id="card-expiry-field"
          hostedFieldType="expirationDate"
          options={{ selector: "#card-expiry", placeholder: "MM/YY" }}
        />
        <div id="card-expiry" className="border rounded p-3 w-full"></div>

        {/* CVV */}
        <PayPalHostedField
          id="card-cvv-field"
          hostedFieldType="cvv"
          options={{ selector: "#card-cvv", placeholder: "CVV" }}
        />
        <div id="card-cvv" className="border rounded p-3 w-full"></div>

        <SubmitCardButton
          bookingId={bookingId}
          amount={amount}
          currency={currency}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    </PayPalHostedFieldsProvider>
  );
}
