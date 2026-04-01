import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Checkout?: any;
  }
}

export default function CheckoutModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}: any) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const checkoutRef = useRef<any>(null);
  const { toast } = useToast();

  // 🔹 STEP 1 — Call Supabase
  const startPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-peach-checkout",
        {
          body: {
            bookingId: bookingDetails.id,
            amount: bookingDetails.totalAmount,
            currency: "MUR",
            customerEmail: bookingDetails.customerEmail,
          },
        }
      );

      if (error) throw error;
      if (!data?.checkoutId) throw new Error("No checkoutId returned");

      setCheckoutId(data.checkoutId);
      setEntityId(data.entityId);
    } catch (error) {
      console.error("Peach error:", error);
      toast({
        title: "Payment Error",
        description: "Could not start payment session.",
        variant: "destructive",
      });
    }
  };

  // 🔹 STEP 2 — Load SDK
  useEffect(() => {
    if (window.Checkout) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://sandbox-checkout.peachpayments.com/js/checkout.js";
    script.async = true;

    script.onload = () => setSdkLoaded(true);

    document.body.appendChild(script);
  }, []);

  // 🔹 STEP 3 — Render checkout
  useEffect(() => {
    if (!sdkLoaded || !checkoutId || !entityId) return;
    if (!window.Checkout) return;

    if (checkoutRef.current) {
      try {
        checkoutRef.current.unmount();
      } catch {}
    }

    try {
      const checkout = window.Checkout.initiate({
        checkoutId,
        key: entityId,

        options: {
          ordering: {
            CARD: 1,
            BLINK: 2,
            JUICE: 3,
            MAUCAS: 4,
          },
        },

        customisations: {
          showCancelButton: false,
          showAmountField: false,
          card: {
            submitButtonText: "Pay Now",
            showBillingFields: false,
          },
        },

        eventHandlers: {
          onCompleted: async () => {
            try {
              await supabase.functions.invoke(
                "verify-peach-payment",
                {
                  body: {
                    checkoutId,
                    bookingId: bookingDetails.id,
                  },
                }
              );
            } catch (err) {
              console.error("Verify error:", err);
            }

            toast({
              title: "Payment Processing",
              description: "We are confirming your payment...",
            });

            onPaymentSuccess();
            onClose();
          },

          onCancelled: () => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment.",
              variant: "destructive",
            });
          },

          onExpired: () => {
            toast({
              title: "Session Expired",
              description: "Please try again.",
              variant: "destructive",
            });
            setCheckoutId(null);
          },

          onError: (event: any) => {
            console.error("Checkout error:", event);

            toast({
              title: "Payment Failed",
              description:
                event?.result?.description || "Payment failed.",
              variant: "destructive",
            });
          },
        },
      });

      checkout.render("#peach-checkout-container");
      checkoutRef.current = checkout;
    } catch (err) {
      console.error("Render error:", err);
    }
  }, [sdkLoaded, checkoutId, entityId]);

  return (
    <div>
      {!checkoutId && (
        <button onClick={startPayment}>
          Proceed to Secure Payment
        </button>
      )}

      <div
        id="peach-checkout-container"
        className="w-full min-h-[600px]"
      />
    </div>
  );
}
