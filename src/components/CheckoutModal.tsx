import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  onPaymentSuccess
}: CheckoutModalProps) {

  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const { toast } = useToast();
  const { formatPrice, currency, exchangeRates } = useCurrency();

  const eurAmount = (bookingDetails.totalAmount * exchangeRates.EUR).toFixed(2);

  /**
   * STEP 1: Create Peach Checkout
   */
  const startPayment = async () => {
    try {
      setProcessing(true);

      // ✅ Store bookingId for verification step
      localStorage.setItem("bookingId", bookingDetails.id);

      const { data, error } = await supabase.functions.invoke(
        "create-peach-checkout",
        {
          body: {
            bookingId: bookingDetails.id,
            amount: eurAmount
          }
        }
      );

      if (error) throw error;

      // ✅ Peach returns "id" (not checkoutId)
      const id = data?.id;

      if (!id) throw new Error("No checkoutId returned");

      setCheckoutId(id);

    } catch (error) {

      console.error("Peach error:", error);

      toast({
        title: "Payment Error",
        description: "Could not start payment session.",
        variant: "destructive"
      });

    } finally {
      setProcessing(false);
    }
  };

  /**
   * STEP 2: Load Peach Widget Script
   */
  useEffect(() => {

    if (!checkoutId) return;

    const script = document.createElement("script");
    script.src = `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };

  }, [checkoutId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="max-w-md max-h-[90vh]">

        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">

          <div className="space-y-4">

            {/* Booking Summary */}
            <Card>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">

                <div className="flex justify-between">
                  <span>Car:</span>
                  <span className="font-medium">{bookingDetails.carName}</span>
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
                  <span>{bookingDetails.startDate} - {bookingDetails.endDate}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total ({currency})</span>
                  <span>{formatPrice(bookingDetails.totalAmount)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total (EUR)</span>
                  <span>€ {eurAmount}</span>
                </div>

              </CardContent>

            </Card>

            {/* STEP 3: Start Payment */}
            {!checkoutId && (
              <Button
                onClick={startPayment}
                className="w-full"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    Connecting to secure payment...
                  </>
                ) : (
                  "Proceed to Secure Payment"
                )}
              </Button>
            )}

            {/* STEP 4: Peach Widget */}
            {checkoutId && (
              <div className="mt-4">

                <form
                  action="/payment-result"
                  className="paymentWidgets"
                  data-brands="VISA MASTER AMEX"
                ></form>

              </div>
            )}

          </div>

        </ScrollArea>

      </DialogContent>

    </Dialog>
  );
}
