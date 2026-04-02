import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const checkoutRef = useRef<any>(null);
  const { toast } = useToast();

  // ==========================
  // STEP 1 — CREATE CHECKOUT
  // ==========================
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
    } finally {
      setProcessing(false);
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

    script.onerror = () => {
      toast({
        title: "SDK Error",
        description: "Failed to load payment SDK.",
        variant: "destructive",
      });
    };

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
      setAgreedToTerms(false);

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>
            {step === "summary"
              ? "Complete Your Booking"
              : "Payment Options"}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">

          {/* STEP 1 — SUMMARY */}
          {step === "summary" && (
            <>
              <Card className="text-sm">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><b>Car:</b> {bookingDetails.carName}</div>
                  <div><b>Start:</b> {bookingDetails.startDate}</div>
                  <div><b>End:</b> {bookingDetails.endDate}</div>
                  <div><b>Email:</b> {bookingDetails.customerEmail}</div>
                  <div className="pt-2 border-t font-bold">
                    Total: MUR {bookingDetails.totalAmount}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="underline"
                  >
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <Button
                onClick={startPayment}
                disabled={processing || !agreedToTerms}
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Proceed to Secure Payment"
                )}
              </Button>
            </>
          )}

          {/* STEP 2 — PAYMENT */}
          {step === "payment" && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("summary")}
              >
                ← Back
              </Button>

              <div
                id="peach-checkout-container"
                className="w-full min-h-[700px]"
              />

              {!sdkLoaded && (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
