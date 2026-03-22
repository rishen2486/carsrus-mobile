import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutModal } from '@/components/CheckoutModal';

interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  pickup_location: string;
  dropoff_location: string;
  customer_email: string;
  payment_status: string;
  car: {
    name: string;
  };
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const { data } = await supabase
        .from('bookings')
        .select('*, car:cars(name)')
        .eq('id', id)
        .single();

      if (!data) return;

      setBooking(data);

      if (data.payment_status === 'paid') {
        navigate(`/booking/${data.id}/confirmation`);
      } else {
        setIsCheckoutOpen(true); // AUTO OPEN
      }
    };

    load();
  }, [id]);

  const handlePaymentSuccess = async () => {
    if (!booking) return;

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

    navigate(`/booking/${booking.id}/confirmation`);
  };

  return (
    <>
      {booking && booking.payment_status !== 'paid' && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => navigate('/cars')}
          bookingDetails={{
            id: booking.id,
            totalAmount: booking.total_amount,
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default BookingPage;
