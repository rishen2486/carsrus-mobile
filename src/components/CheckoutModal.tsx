const checkout = window.Checkout.initiate({
  checkoutId,
  key: entityId,

  options: {
    // ✅ DO NOT restrict methods
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
