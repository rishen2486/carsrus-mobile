// FILE: src/components/ui/CheckoutModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import PayPalCardCheckout from "@/components/payments/PayPalCardCheckout";

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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { currency, exchangeRates, formatPrice } = useCurrency();

  const eurAmount = Number(
    (bookingDetails.totalAmount * exchangeRates.EUR).toFixed(2)
  );

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
                  <span>
                    {bookingDetails.startDate} - {bookingDetails.endDate}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total ({currency}):</span>
                  <span>{formatPrice(bookingDetails.totalAmount)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg mt-1">
                  <span>Total (EUR):</span>
                  <span>€ {eurAmount.toFixed(2)}</span>
                </div>

                <p className="text-sm mt-1">
                  You will be billed in EUR via PayPal (Secure Card Payment).
                </p>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="space-y-3">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <label htmlFor="card" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit / Debit Card (PayPal Hosted Fields)
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* PayPal Hosted Fields */}
            {paymentMethod === "card" && (
              <PayPalCardCheckout
                bookingId={bookingDetails.id}
                eurAmount={eurAmount}
                onSuccess={onPaymentSuccess}
                onError={(err) => console.error(err)}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
