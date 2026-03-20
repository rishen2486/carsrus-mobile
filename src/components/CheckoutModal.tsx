import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

declare global {
  interface Window {
    Checkout?: {
      initiate: (options: any) => { render: (container: string | HTMLElement) => void; unmount: () => void };
    };
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    id: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    pickupLocation: string;
    dropoffLocation: string;
  };
  onPaymentSuccess: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const checkoutRef = useRef<{ unmount: () => void } | null>(null);

  const { toast } = useToast();
  const { formatPrice, currency, exchangeRates } = useCurrency();

  const murAmount = bookingDetails.totalAmount;

  /** Create Peach checkout session */
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

  /** Load Peach Embedded Checkout SDK */
  useEffect(() => {
    if (!checkoutId) return;

    // Check if SDK already loaded
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

    return () => {
      // Don't remove script — it may be reused
    };
  }, [checkoutId]);

  /** Render embedded checkout once SDK + checkoutId are ready */
  useEffect(() => {
    if (!sdkLoaded || !checkoutId || !entityId || !window.Checkout) return;

    // Small delay to ensure DOM container exists
    const timeout = setTimeout(() => {
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
              showCardIcon: true,
              showBillingFields: false,
              brands: ["VISA", "MASTERCARD", "AMEX"],
            },
          },
          eventHandlers: {
            onCompleted: async (event: any) => {
              console.log("Payment completed:", event);
              // Verify payment server-side
              try {
                await supabase.functions.invoke("verify-peach-payment", {
                  body: {
                    checkoutId: checkoutId,
                    bookingId: bookingDetails.id,
                  },
                });
              } catch (verifyErr) {
                console.error("Verify error (webhook will handle):", verifyErr);
              }
              toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed.",
              });
              onPaymentSuccess();
              onClose();
            },
            onCancelled: (event: any) => {
              console.log("Payment cancelled:", event);
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment.",
                variant: "destructive",
              });
            },
            onExpired: (event: any) => {
              console.log("Checkout expired:", event);
              toast({
                title: "Session Expired",
                description: "Payment session timed out. Please try again.",
                variant: "destructive",
              });
              setCheckoutId(null);
              setSdkLoaded(false);
            },
            onError: (event: any) => {
              console.error("Payment error:", event);
              toast({
                title: "Payment Failed",
                description:
                  event?.result?.description || "An error occurred.",
                variant: "destructive",
              });
            },
          },
        });

        checkout.render("#peach-checkout-container");
        checkoutRef.current = checkout;
      } catch (err) {
        console.error("Checkout render error:", err);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (checkoutRef.current) {
        try {
          checkoutRef.current.unmount();
        } catch {}
        checkoutRef.current = null;
      }
    };
  }, [sdkLoaded, checkoutId, entityId]);

  /** Reset state when modal closes */
  useEffect(() => {
    if (!isOpen) {
      if (checkoutRef.current) {
        try {
          checkoutRef.current.unmount();
        } catch {}
        checkoutRef.current = null;
      }
      setCheckoutId(null);
      setEntityId(null);
      setSdkLoaded(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Booking Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Car:</span>
                  <span className="font-medium">
                    {bookingDetails.carName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup:</span>
                  <span>{bookingDetails.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drop-off:</span>
                  <span>{bookingDetails.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>
                    {bookingDetails.startDate} - {bookingDetails.endDate}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total ({currency})</span>
                  <span>{formatPrice(bookingDetails.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Start Payment Button */}
            {!checkoutId && (
              <Button
                onClick={startPayment}
                className="w-full"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting to secure payment...
                  </>
                ) : (
                  "Proceed to Secure Payment"
                )}
              </Button>
            )}

            {/* Peach Embedded Checkout Container */}
            {checkoutId && (
              <div className="mt-4">
                <div id="peach-checkout-container" className="min-h-[200px]" />
                {!sdkLoaded && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading payment form...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
