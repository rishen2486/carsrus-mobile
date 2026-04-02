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
  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [agreed, setAgreed] = useState(false);

  const checkoutRef = useRef<any>(null);
  const { toast } = useToast();

  // ==========================
  // STEP 1 — CREATE CHECKOUT
  // ==========================
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
      setStep("payment");
    } catch (error) {
      console.error("Peach error:", error);
      toast({
        title: "Payment Error",
        description: "Could not start payment session.",
        variant: "destructive",
      });
    }
  };

  // ==========================
  // STEP 2 — LOAD SDK
  // ==========================
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

  // ==========================
  // STEP 3 — RENDER CHECKOUT
  // ==========================
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
            setStep("summary");
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

  // ==========================
  // RESET WHEN CLOSED
  // ==========================
  useEffect(() => {
    if (!isOpen) {
      setCheckoutId(null);
      setEntityId(null);
      setStep("summary");
      setAgreed(false);

      if (checkoutRef.current) {
        try {
          checkoutRef.current.unmount();
        } catch {}
      }
    }
  }, [isOpen]);

  // ==========================
  // UI
  // ==========================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto">

        {/* STEP 1 — SUMMARY */}
        {step === "summary" && (
          <>
            <h2 className="text-xl font-bold">Booking Summary</h2>

            <div className="space-y-2 text-sm">
              <div><b>Car:</b> {bookingDetails.carName}</div>
              <div><b>Start:</b> {bookingDetails.startDate}</div>
              <div><b>End:</b> {bookingDetails.endDate}</div>
              <div><b>Total:</b> MUR {bookingDetails.totalAmount}</div>
              <div><b>Email:</b> {bookingDetails.customerEmail}</div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-sm">
                I agree to Terms & Conditions
              </span>
            </div>

            <button
              onClick={startPayment}
              disabled={!agreed}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              Proceed to Secure Payment
            </button>

            <button
              onClick={onClose}
              className="w-full border py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}

        {/* STEP 2 — PAYMENT */}
        {step === "payment" && (
          <>
            <button
              onClick={() => setStep("summary")}
              className="mb-2 text-sm underline"
            >
              ← Back
            </button>

            <div id="peach-checkout-container" />
          </>
        )}
      </div>
    </div>
  );
}
