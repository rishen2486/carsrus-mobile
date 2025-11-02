import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/CheckoutModal';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  pickup_location: string;
  dropoff_location: string;
  customer_name: string;
  customer_email: string;
  payment_status: string;
  car: {
    name: string;
    image_url?: string;
  };
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency, exchangeRates } = useCurrency();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('*, car:cars(name, image_url)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
      } else {
        setBooking(data as Booking);
      }
      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  const handlePaymentSuccess = async () => {
    try {
      if (!booking) return;

      // Create availability record and send emails via edge function
      await supabase.functions.invoke('sync-booking', {
        body: {
          action: 'create',
          bookingId: booking.id,
          carId: booking.car_id,
          carName: booking.car?.name,
          startDate: booking.start_date,
          endDate: booking.end_date,
          pickupLocation: booking.pickup_location,
          dropoffLocation: booking.dropoff_location,
          customerEmail: booking.customer_email,
        },
      });

      // Redirect to confirmation page
      navigate(`/booking/${booking.id}/confirmation`);
    } catch (error) {
      console.error('Error in payment success flow:', error);
      navigate(`/booking/${booking.id}/confirmation`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <p>Loading booking details...</p>
        </div>
      </div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg mb-4">Booking not found</p>
          <Button asChild>
            <Link to="/cars">Browse Cars</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cars">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Booking Details</CardTitle>
              {booking.payment_status !== 'paid' && (
                <p className="text-sm text-muted-foreground">
                  Complete your payment to confirm this booking
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.car?.image_url && (
                <img
                  src={booking.car.image_url}
                  alt={booking.car.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              <div className="space-y-2">
                <p><strong>Car:</strong> {booking.car?.name}</p>
                <p><strong>Customer:</strong> {booking.customer_name}</p>
                <p><strong>Email:</strong> {booking.customer_email}</p>
                <p><strong>Pickup:</strong> {booking.pickup_location}</p>
                <p><strong>Drop-off:</strong> {booking.dropoff_location}</p>
                <p><strong>Dates:</strong> {booking.start_date} → {booking.end_date}</p>
                <p className="text-lg font-bold">
                  Total ({currency}): {formatPrice(booking.total_amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total (EUR): € {(booking.total_amount * exchangeRates.EUR).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground italic mb-2">
                  (Amount that will be billed on Credit Card)
                </p>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.payment_status === 'paid' ? 'Confirmed' : 'Pending Payment'}
                  </span>
                </div>
              </div>
              
              {booking.payment_status !== 'paid' && (
                <Button onClick={() => setIsCheckoutOpen(true)} className="w-full">
                  Proceed to Payment
                </Button>
              )}
              
              {booking.payment_status === 'paid' && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ Your booking is confirmed! You will receive a confirmation email shortly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkout Modal */}
          {booking && booking.payment_status !== 'paid' && (
            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              bookingDetails={{
                id: booking.id,
                carName: booking.car?.name || 'Car',
                startDate: booking.start_date,
                endDate: booking.end_date,
                totalAmount: booking.total_amount,
                pickupLocation: booking.pickup_location,
                dropoffLocation: booking.dropoff_location,
              }}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;