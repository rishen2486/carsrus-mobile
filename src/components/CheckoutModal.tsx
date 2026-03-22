import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Checkout?: any;
  }
}

export function CheckoutModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}: any) {
  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const checkoutRef = useRef<any>(null);
  const { toast } = useToast();

  /**
   * STEP 1 — Create checkout
   */
  const startPayment = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke(
        "create-peach-checkout",
        {
          body: {
            bookingId: bookingDetails.id,
            amount: bookingDetails.totalAmount,
            currency: "MUR",
          },
        }
      );

      if (error) throw error;
      if (!data?.checkoutId) throw new Error("No checkoutId returned");

      setCheckoutId(data.checkoutId);
      setEntityId(data.entityId);
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment Error",
        description: "Could not start payment session.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  /**
   * STEP 2 — Load SDK
   */
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

    script.onerror = () => {
      toast({
        title: "SDK Error",
        description: "Failed to load payment SDK.",
        variant: "destructive",
      });
    };

    document.body.appendChild(script);
  }, []);

  /**
   * STEP 3 — Render checkout
   */
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
          paymentMethods: {
            include: ["CARD"],
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
              console.error(err);
            }

            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed.",
            });

            onPaymentSuccess();
            onClose();
          },

          onCancelled: () => {
            toast({
              title: "Payment Cancelled",
              variant: "destructive",
            });
          },

          onExpired: () => {
            toast({
              title: "Session Expired",
              variant: "destructive",
            });
            setCheckoutId(null);
          },

          onError: (event: any) => {
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

  /**
   * Cleanup
   */
  useEffect(() => {
    if (!isOpen && checkoutRef.current) {
      try {
        checkoutRef.current.unmount();
      } catch {}
      checkoutRef.current = null;
      setCheckoutId(null);
      setEntityId(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl h-[95vh] p-4">
        <DialogHeader>
          <DialogTitle>Secure Payment</DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-auto space-y-4">
          {!checkoutId && (
            <Button
              onClick={startPayment}
              className="w-full h-12 text-lg"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          )}

          {checkoutId && (
            <div id="peach-checkout-container" className="w-full min-h-[600px]" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
