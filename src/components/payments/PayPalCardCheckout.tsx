import { useEffect, useState, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hostedFieldsRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initHostedFields = async () => {
      if (!window.paypal) {
        console.error("❌ PayPal SDK not loaded");
        setError("PayPal SDK not loaded");
        setIsLoading(false);
        return;
      }

      try {
        // Get client token from our edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          "paypal-payment",
          { body: { action: "get-client-token" } }
        );

        if (tokenError || !tokenData?.clientToken) {
          throw new Error(tokenError?.message || "Failed to get client token");
        }

        if (!isMounted) return;

        const paypal = window.paypal;

        // Check if Hosted Fields is eligible
        if (!paypal.HostedFields.isEligible()) {
          setError("Card payments are not available. Please try another payment method.");
          setIsLoading(false);
          return;
        }

        const cardFields = await paypal.HostedFields.render({
          createOrder: async () => {
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
          },

          styles: {
            input: {
              "font-size": "16px",
              "font-family": "Helvetica, Arial, sans-serif",
              color: "#333",
              padding: "8px",
            },
            ".invalid": {
              color: "#c00",
            },
          },

          fields: {
            number: {
              selector: "#card-number-field",
              placeholder: "4111 1111 1111 1111",
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
        });

        if (!isMounted) return;

        hostedFieldsRef.current = cardFields;

        // Detect card type
        cardFields.on("cardTypeChange", (event: any) => {
          if (event.cards?.length === 1) {
            setCardBrand(event.cards[0].type);
          } else {
            setCardBrand("");
          }
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error("❌ Hosted Fields init error:", err);
        if (isMounted) {
          setError(err.message || "Failed to initialize payment form");
          setIsLoading(false);
        }
      }
    };

    initHostedFields();

    return () => {
      isMounted = false;
    };
  }, [bookingId, eurAmount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!hostedFieldsRef.current) {
      toast({
        title: "Error",
        description: "Payment form not ready. Please wait and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const payload = await hostedFieldsRef.current.submit();

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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading payment form...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3">
      {/* Card Brand Indicator */}
      {cardBrand && (
        <div className="text-sm text-muted-foreground">
          Detected Card: <span className="font-semibold">{cardBrand.toUpperCase()}</span>
        </div>
      )}

      {/* Card Number */}
      <div>
        <label className="text-sm font-medium">Card Number</label>
        <div
          id="card-number-field"
          className="border border-input bg-background p-3 rounded-md mt-1 h-11"
        ></div>
      </div>

      <div className="flex gap-3">
        {/* Expiration Date */}
        <div className="w-1/2">
          <label className="text-sm font-medium">Expiry</label>
          <div
            id="expiration-date-field"
            className="border border-input bg-background p-3 rounded-md mt-1 h-11"
          ></div>
        </div>

        {/* CVV */}
        <div className="w-1/2">
          <label className="text-sm font-medium">CVV</label>
          <div 
            id="cvv-field" 
            className="border border-input bg-background p-3 rounded-md mt-1 h-11"
          ></div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
