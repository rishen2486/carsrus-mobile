import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditCard, QrCode, Smartphone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [maupassConfirmed, setMaupassConfirmed] = useState(false);
  const { toast } = useToast();
  const { formatPrice, currency, exchangeRates } = useCurrency();

  const eurAmount = (bookingDetails.totalAmount * exchangeRates.EUR).toFixed(2);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';

  useEffect(() => {
    console.log('✅ CheckoutModal mounted');
    console.log('PayPal Client ID:', paypalClientId);
  }, [paypalClientId]);

  const isCardFormValid =
    cardDetails.name && cardDetails.number && cardDetails.expiry && cardDetails.cvv;

  const handleCardPayment = async () => {
    if (!isCardFormValid) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingDetails.id);
      if (error) throw error;

      toast({ title: 'Payment Successful!', description: 'Your booking has been confirmed.' });
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Card payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your card.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: 'EUR',
        intent: 'capture',
        components: 'buttons',
        // 👇 Add Advanced Card Fields support (required for card-only mode)
        'enable-funding': 'card',
        'disable-funding': 'credit,p24,giropay,sofort',
      }}
    >
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
                    <span>
                      €{' '}
                      {(bookingDetails.totalAmount * exchangeRates.EUR).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">(EUR amount will be billed via PayPal)</p>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                      <QrCode className="w-4 h-4 mr-2" />
                      Maupass (Scan to pay)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex flex-col cursor-pointer">
                      <span className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Credit/Debit Card
                      </span>
                      <span className="text-xs text-muted-foreground ml-6">
                        Using PayPal platform for a secure Card Transaction - You can use either your Credit/Debit Card or your PayPal account
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Maupass QR Payment */}
              {paymentMethod === 'credit-card' && (
                <div className="pt-4 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span className="font-medium">Scan with any Mauritian digital wallet</span>
                    </div>
                    
                    {/* Placeholder QR Code */}
                    <div className="bg-white p-4 rounded-lg inline-block mx-auto mb-3">
                      <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2">
                        <QrCode className="w-16 h-16 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">QR Code</span>
                        <span className="text-xs text-muted-foreground font-medium">{formatPrice(bookingDetails.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Compatible with:</p>
                      <p className="font-medium text-foreground">MCB Juice • Blink by Emtel • my.t money</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                    <p className="text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> MauCAS QR integration requires a merchant account. This is a placeholder for demonstration purposes. Contact us to enable live payments.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maupass-confirm"
                      checked={maupassConfirmed}
                      onChange={(e) => setMaupassConfirmed(e.target.checked)}
                      className="rounded border-input"
                    />
                    <Label htmlFor="maupass-confirm" className="text-sm cursor-pointer">
                      I have completed the payment via my mobile wallet
                    </Label>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!maupassConfirmed) {
                        toast({
                          title: 'Please confirm payment',
                          description: 'Check the box to confirm you have completed the payment.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setProcessing(true);
                      try {
                        const { error } = await supabase
                          .from('bookings')
                          .update({ payment_status: 'paid' })
                          .eq('id', bookingDetails.id);
                        if (error) throw error;
                        toast({
                          title: 'Payment Confirmed!',
                          description: 'Your booking has been confirmed.',
                        });
                        onPaymentSuccess();
                        onClose();
                      } catch (error) {
                        console.error('Maupass payment error:', error);
                        toast({
                          title: 'Error',
                          description: 'Could not confirm payment. Please try again.',
                          variant: 'destructive',
                        });
                      } finally {
                        setProcessing(false);
                      }
                    }}
                    disabled={processing || !maupassConfirmed}
                    className="w-full"
                  >
                    {processing ? (
                      'Processing...'
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* PayPal Payment */}
              {paymentMethod === 'paypal' && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Pay securely using PayPal or your card. No shipping details required.
                  </p>

                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={async () => {
                      try {
                        console.log('Creating PayPal order (no billing/shipping)...');
                        const { data: orderData, error } = await supabase.functions.invoke('paypal-payment', {
                          body: {
                            action: 'create-order',
                            amount: parseFloat(eurAmount),
                            bookingId: bookingDetails.id,
                            application_context: {
                              shipping_preference: 'NO_SHIPPING',
                              user_action: 'PAY_NOW',
                              brand_name: 'RoadReady Rent',
                            },
                            payer: {
                              address: {
                                country_code: 'MU',
                              },
                            },
                          },
                        });
                        if (error || !orderData?.id)
                          throw new Error(error?.message || 'Order creation failed');
                        return orderData.id;
                      } catch (err) {
                        console.error('PayPal createOrder error:', err);
                        toast({
                          title: 'Payment Failed',
                          description: 'Could not create PayPal order.',
                          variant: 'destructive',
                        });
                        throw err;
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        console.log('Capturing PayPal order...', data.orderID);
                        const { data: captureData, error } = await supabase.functions.invoke('paypal-payment', {
                          body: {
                            action: 'capture-order',
                            orderId: data.orderID,
                            bookingId: bookingDetails.id,
                          },
                        });
                        if (error || captureData?.status !== 'COMPLETED')
                          throw new Error(error?.message || 'Payment not completed');
                        toast({
                          title: 'PayPal Payment Successful!',
                          description: 'Your booking has been confirmed via PayPal.',
                        });
                        onPaymentSuccess();
                        onClose();
                      } catch (err) {
                        console.error('PayPal capture error:', err);
                        toast({
                          title: 'Payment Failed',
                          description: 'Could not complete PayPal payment.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    onError={(err) => {
                      console.error('PayPal SDK error:', err);
                      toast({
                        title: 'Payment Error',
                        description: 'PayPal could not process your payment.',
                        variant: 'destructive',
                      });
                    }}
                    onCancel={() => {
                      console.log('PayPal payment cancelled.');
                      toast({
                        title: 'Payment Cancelled',
                        description: 'You cancelled the PayPal payment.',
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </PayPalScriptProvider>
  );
}
