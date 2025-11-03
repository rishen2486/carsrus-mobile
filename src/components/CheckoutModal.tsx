import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({ 
    number: '', 
    expiry: '', 
    cvv: '', 
    name: ''
  });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { formatPrice, currency, exchangeRates } = useCurrency();

  const eurAmount = (bookingDetails.totalAmount * exchangeRates.EUR).toFixed(2);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
  console.log("PayPal Client ID from env:", import.meta.env.VITE_PAYPAL_CLIENT_ID);
  console.log("Rendering PayPal buttons with client ID:", paypalClientId);
  
  const isCardFormValid = cardDetails.name && 
    cardDetails.number && 
    cardDetails.expiry && 
    cardDetails.cvv;

  const handleCardPayment = async () => {
    if (!isCardFormValid) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Simulate card processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking as paid
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingDetails.id);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed.",
      });
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Card payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your card.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  console.log("CheckoutModal mount, clientId=", paypalClientId);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
        </DialogHeader>

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
                <span>Total ({currency}):</span>
                <span>{formatPrice(bookingDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-1">
                <span>Total (EUR):</span>
                <span>€ {(bookingDetails.totalAmount * exchangeRates.EUR).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-sm mt-1">
                (EUR amount will be billed on credit card)
              </p>
              <div className="flex items-center gap-2 pt-2">
                <strong>Status:</strong>
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Pending Payment
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit-card" id="credit-card" />
                <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="debit-card" id="debit-card" />
                <Label htmlFor="debit-card" className="flex items-center cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                  <DollarSign className="w-4 h-4 mr-2" />
                  PayPal Account
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Form */}
          {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardName">Cardholder Name *</Label>
                <Input
                  id="cardName"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry Date *</Label>
                  <Input
                    id="expiry"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <Button
                onClick={handleCardPayment}
                disabled={processing || !isCardFormValid}
                className="w-full"
              >
                {processing ? 'Processing...' : `Pay € ${(bookingDetails.totalAmount * exchangeRates.EUR).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Button>
            </div>
          )}

          {/* PayPal Button */}
          {paymentMethod === 'paypal' && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                You will be redirected to PayPal to complete your payment securely.
              </p>
              <PayPalScriptProvider options={{ 
                client-id: paypalClientId,
                currency: "EUR",
                intent: "capture"
              }}>
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={async (data, actions) => {
                    try {
                      console.log('Creating PayPal order...', { amount: eurAmount, bookingId: bookingDetails.id });
                      
                      // Create order via backend edge function
                      const { data: orderData, error } = await supabase.functions.invoke('paypal-payment', {
                        body: {
                          action: 'create-order',
                          amount: parseFloat(eurAmount),
                          bookingId: bookingDetails.id,
                        },
                      });

                      console.log('PayPal order response:', { orderData, error });

                      if (error) {
                        console.error('Failed to create PayPal order:', error);
                        toast({
                          title: "Payment Failed",
                          description: `Could not create PayPal order: ${error.message}`,
                          variant: "destructive",
                        });
                        throw new Error('Failed to create order');
                      }

                      if (!orderData?.id) {
                        console.error('No order ID returned:', orderData);
                        toast({
                          title: "Payment Failed",
                          description: "Could not create PayPal order. Please try again.",
                          variant: "destructive",
                        });
                        throw new Error('No order ID returned');
                      }

                      console.log('PayPal order created successfully:', orderData.id);
                      return orderData.id;
                    } catch (err) {
                      console.error('Error in createOrder:', err);
                      throw err;
                    }
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      console.log('Capturing PayPal order...', { orderId: data.orderID });
                      
                      // Capture order via backend edge function
                      const { data: captureData, error } = await supabase.functions.invoke('paypal-payment', {
                        body: {
                          action: 'capture-order',
                          orderId: data.orderID,
                          bookingId: bookingDetails.id,
                        },
                      });

                      console.log('PayPal capture response:', { captureData, error });

                      if (error) {
                        console.error('Failed to capture payment:', error);
                        throw new Error(`Failed to capture payment: ${error.message}`);
                      }

                      if (captureData?.status !== 'COMPLETED') {
                        console.error('Payment not completed:', captureData);
                        throw new Error('Payment was not completed');
                      }

                      console.log('PayPal payment completed successfully');
                      toast({
                        title: "PayPal Payment Successful!",
                        description: "Your booking has been confirmed via PayPal.",
                      });
                      onPaymentSuccess();
                      onClose();
                    } catch (err) {
                      console.error('PayPal capture error:', err);
                      toast({
                        title: "Payment Failed",
                        description: err instanceof Error ? err.message : "Could not complete PayPal payment.",
                        variant: "destructive",
                      });
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal SDK error:', err);
                    toast({
                      title: "Payment Failed",
                      description: "PayPal could not process your payment. Please try again.",
                      variant: "destructive",
                    });
                  }}
                  onCancel={() => {
                    console.log('PayPal payment cancelled by user');
                    toast({
                      title: "Payment Cancelled",
                      description: "You cancelled the PayPal payment.",
                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
