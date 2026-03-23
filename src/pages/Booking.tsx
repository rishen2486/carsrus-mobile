import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutModal } from "@/components/CheckoutModal";
import Navbar from "@/components/layout/Navbar";

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
  };
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*, car:cars(name)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching booking:", error);
      } else {
        setBooking(data as Booking);

        // AUTO OPEN CHECKOUT
        if (data.payment_status !== "paid") {
          setIsCheckoutOpen(true);
        } else {
          navigate(`/booking/${data.id}/confirmation`);
        }
      }

      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  const handlePaymentSuccess = async () => {
    try {
      if (!booking) return;

      await supabase.functions.invoke("sync-booking", {
        body: {
          action: "create",
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
    } catch (error) {
      console.error("Error in payment success flow:", error);
      navigate(`/booking/${booking.id}/confirmation`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Preparing secure payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {booking && booking.payment_status !== "paid" && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => navigate("/cars")}
          bookingDetails={{
            id: booking.id,
            carName: booking.car?.name || "Car",
            startDate: booking.start_date,
            endDate: booking.end_date,
            totalAmount: booking.total_amount,
            pickupLocation: booking.pickup_location,
            dropoffLocation: booking.dropoff_location,
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            paymentStatus: booking.payment_status,
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BookingPage;
