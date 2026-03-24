import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const [step, setStep] = useState<"summary" | "payment">("summary");

  const checkoutRef = useRef<any>(null);

  const { toast } = useToast();
  const { formatPrice, currency } = useCurrency();

  const murAmount = bookingDetails.totalAmount;

  // STEP 1 — Call Supabase
  const startPayment = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke(
        "create-peach-checkout",
        {
          body: {
            bookingId: bookingDetails.id,
            amount: murAmount,
            currency: "MUR",
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

  const handleBack = () => {
    if (checkoutRef.current) {
      try { checkoutRef.current.unmount(); } catch {}
      checkoutRef.current = null;
    }
    setCheckoutId(null);
    setEntityId(null);
    setStep("summary");
  };

  // STEP 2 — Load SDK
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

  // STEP 3 — Render checkout
  useEffect(() => {
    if (!sdkLoaded || !checkoutId || !entityId) return;
    if (!window.Checkout) return;

    const container = document.getElementById(
      "peach-checkout-container"
    );
    if (!container) return;

    // cleanup previous instance
    if (checkoutRef.current) {
      try {
        checkoutRef.current.unmount();
      } catch {}
      checkoutRef.current = null;
    }

    try {
      const checkout = window.Checkout.initiate({
        checkoutId,
        key: entityId,

        options: {
          paymentMethods: {
            include: ["CARD"],
          },
          ordering: {
            CARD: 1,
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
              title: "Payment Successful!",
              description: "Your booking has been confirmed.",
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

  // Cleanup
  useEffect(() => {
    if (!isOpen && checkoutRef.current) {
      try {
        checkoutRef.current.unmount();
      } catch {}
      checkoutRef.current = null;
      setCheckoutId(null);
      setEntityId(null);
      setStep("summary");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">
          {/* Booking Summary */}
          <Card className="text-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Car:</span>
                <span className="font-medium">{bookingDetails.carName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{bookingDetails.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">{bookingDetails.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Location:</span>
                <span className="font-medium">{bookingDetails.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drop-off Location:</span>
                <span className="font-medium">{bookingDetails.dropoffLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Name:</span>
                <span className="font-medium">{bookingDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Email:</span>
                <span className="font-medium">{bookingDetails.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-medium capitalize">{bookingDetails.paymentStatus || 'pending'}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total ({currency})</span>
                <span className="text-primary">
                  {formatPrice(bookingDetails.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Button */}
          {!checkoutId && (
            <Button
              onClick={startPayment}
              className="w-full"
              disabled={processing}
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
          )}

          {/* Checkout */}
          {checkoutId && (
            <div className="mt-4">
              <div
                id="peach-checkout-container"
                className="w-full min-h-[900px]"
              />
              {!sdkLoaded && (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
