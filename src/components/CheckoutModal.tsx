import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck } from "lucide-react";
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
   * STEP 1 — Create checkout session
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
      if (!data?.checkoutId) throw new Error("No checkoutId");

      setCheckoutId(data.checkoutId);
      setEntityId(data.entityId);
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment Error",
        description: "Unable to start secure payment.",
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
    script.src = "https://sandbox-checkout.peachpayments.com/js/checkout.js";
    script.async = true;

    script.onload = () => setSdkLoaded(true);
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Payment SDK failed to load.",
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

    const checkout = window.Checkout.initiate({
      checkoutId,
      key: entityId,

      options: {
        paymentMethods: {
          include: ["CARD"], // ready for BLINK/JUICE later
        },
      },

      customisations: {
        showCancelButton: false,
        showAmountField: false,
        card: {
          submitButtonText: "Pay Securely",
          showBillingFields: false,
        },
      },

      eventHandlers: {
        onCompleted: async () => {
          try {
            await supabase.functions.invoke("verify-peach-payment", {
              body: {
                checkoutId,
                bookingId: bookingDetails.id,
              },
            });
          } catch (err) {
            console.error(err);
          }

          onPaymentSuccess();
          onClose();
        },

        onError: (e: any) => {
          toast({
            title: "Payment Failed",
            description: e?.result?.description || "Try again",
            variant: "destructive",
          });
        },
      },
    });

    checkout.render("#peach-checkout-container");
    checkoutRef.current = checkout;
  }, [sdkLoaded, checkoutId, entityId]);

  /**
   * AUTO START PAYMENT (STRIPE STYLE)
   */
  useEffect(() => {
    if (isOpen && !checkoutId) {
      startPayment();
    }
  }, [isOpen]);

  /**
   * CLEANUP
   */
  useEffect(() => {
    if (!isOpen && checkoutRef.current) {
      try {
        checkoutRef.current.unmount();
      } catch {}
      checkoutRef.current = null;
      setCheckoutId(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* FULL SCREEN CHECKOUT */}
      <DialogContent className="w-full h-screen max-w-none p-0">

        {/* HEADER (STRIPE STYLE) */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure Payment
          </div>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground"
          >
            Cancel
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-full overflow-auto flex flex-col items-center">

          {!checkoutId && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin w-6 h-6" />
              <p className="text-sm text-muted-foreground">
                Preparing secure checkout...
              </p>
            </div>
          )}

          <div
            id="peach-checkout-container"
            className="w-full max-w-md mt-6"
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}
