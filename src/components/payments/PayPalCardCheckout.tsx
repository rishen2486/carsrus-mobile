// FILE: src/components/payments/PayPalCardCheckout.tsx
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalCardCheckoutProps {
  bookingId: string;
  eurAmount: number;
  onSuccess: () => void;
  onError: (error: any) => void;
}

export default function PayPalCardCheckout({
  bookingId,
  eurAmount,
  onSuccess,
  onError,
}: PayPalCardCheckoutProps) {
  const { toast } = useToast();
  const [cardBrand, setCardBrand] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!window.paypal) {
      console.error("❌ PayPal SDK not loaded");
      return;
    }

    const paypal = window.paypal;

    paypal.HostedFields.render({
      createOrder: async () => {
        try {
          const { data, error } = await supabase.functions.invoke("paypal-payment", {
            body: {
              action: "create-order",
              amount: eurAmount,
              bookingId,
            },
          });

          if (error || !data?.id) {
            throw new Error(error?.message || "Order creation failed");
          }

          return data.id;
        } catch (err) {
          console.error("❌ Error creating order:", err);
          onError(err);
          throw err;
        }
      },

      styles: {
        input: {
          "font-size": "16px",
          "font-family": "Helvetica, Arial, sans-serif",
          color: "#333",
        },
        ".invalid": {
          color: "red",
        },
      },

      fields: {
        number: {
          selector: "#card-number-field",
          placeholder: "Card Number",
        },
        cvv: {
          selector: "#cvv-field",
          placeholder: "123",
        },
        expirationDate: {
          selector: "#expiration-date-field",
          placeholder: "MM/YY",
        },
      },
    }).then((cardFields: any) => {
      // Detect card type
      cardFields.on("cardTypeChange", (event: any) => {
        if (event.cards?.length === 1) {
          setCardBrand(event.cards[0].type);
        } else {
          setCardBrand("");
        }
      });

      const form = document.getElementById("paypal-card-form") as HTMLFormElement;

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        setIsProcessing(true);

        try {
          const payload = await cardFields.submit();

          const { data, error } = await supabase.functions.invoke("paypal-payment", {
            body: {
              action: "capture-order",
              orderId: payload.orderId,
              bookingId,
            },
          });

          if (error || data?.status !== "COMPLETED") {
            throw new Error("Payment not completed");
          }

          toast({
            title: "Payment Successful",
            description: "Your booking has been confirmed.",
          });

          onSuccess();
        } catch (err) {
          console.error("❌ Hosted Fields payment error:", err);

          toast({
            title: "Payment Failed",
            description: "Your card payment could not be processed.",
            variant: "destructive",
          });

          onError(err);
        } finally {
          setIsProcessing(false);
        }
      });
    });
  }, [bookingId, eurAmount, onSuccess, onError, toast]);

  return (
    <form id="paypal-card-form" className="space-y-4 mt-3">

      {/* Card Number */}
      <div>
        <label className="text-sm font-medium">Card Number</label>
        <div
          id="card-number-field"
          className="border p-2 rounded-md mt-1"
        ></div>
      </div>

      {/* Card Brand Indicator */}
      {cardBrand && (
        <div className="text-sm text-gray-600 -mt-2">
          Detected Card: <span className="font-semibold">{cardBrand.toUpperCase()}</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* CVV */}
        <div className="w-1/2">
          <label className="text-sm font-medium">CVV</label>
          <div id="cvv-field" className="border p-2 rounded-md mt-1"></div>
        </div>

        {/* Expiration */}
        <div className="w-1/2">
          <label className="text-sm font-medium">Expiry</label>
          <div
            id="expiration-date-field"
            className="border p-2 rounded-md mt-1"
          ></div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}
