import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (!window.paypal) {
      console.error("PayPal SDK not loaded");
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
              application_context: {
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
              },
            },
          });

          if (error || !data?.id) throw new Error(error?.message || "Order creation failed");
          return data.id;
        } catch (err) {
          console.error("Error creating PayPal order:", err);
          onError(err);
          throw err;
        }
      },

      styles: {
        input: {
          "font-size": "16px",
          "font-family": "Helvetica, Arial, sans-serif",
        },
        ".valid": { color: "#0f9d58" },
        ".invalid": { color: "#db4437" },
      },

      fields: {
        number: { selector: "#card-number", placeholder: "Card Number" },
        cvv: { selector: "#cvv", placeholder: "CVV" },
        expirationDate: { selector: "#expiration-date", placeholder: "MM/YY" },
      },
    }).then((cardFields: any) => {
      const form = document.getElementById("paypal-card-form") as HTMLFormElement;

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
          const payload = await cardFields.submit();

          const { data, error } = await supabase.functions.invoke("paypal-payment", {
            body: {
              action: "capture-order",
              orderId: payload.orderId,
              bookingId,
            },
          });

          if (error || data?.status !== "COMPLETED")
            throw new Error("Payment not completed");

          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed.",
          });

          onSuccess();
        } catch (err) {
          console.error("Card payment error:", err);
          toast({
            title: "Payment Failed",
            description: "Could not complete card payment.",
            variant: "destructive",
          });
          onError(err);
        }
      });
    });
  }, [bookingId, eurAmount, onSuccess, onError, toast]);

  return (
    <form id="paypal-card-form" className="space-y-3 mt-3">
      <div id="card-number" className="border p-2 rounded-md"></div>
      <div className="flex gap-3">
        <div id="cvv" className="border p-2 rounded-md w-1/2"></div>
        <div id="expiration-date" className="border p-2 rounded-md w-1/2"></div>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90"
      >
        Pay Now
      </button>
    </form>
  );
}
