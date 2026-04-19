import { useState, useEffect } from "react";
import { format, isPast, parseISO } from "date-fns";
import { Calendar, Car, MapPin, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CarDetailsModal from "@/components/cars/CarDetailsModal";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  dropoff_location: string;
  total_amount: number;
  payment_status: string | null;
  item_type: string | null;
  created_at: string | null;
  cars?: any | null;
}

interface BookingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const BookingsModal = ({ open, onOpenChange, userId }: BookingsModalProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (open && userId) {
      fetchBookings();
    }
  }, [open, userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          start_date,
          end_date,
          pickup_location,
          dropoff_location,
          total_amount,
          payment_status,
          item_type,
          created_at,
          cars (*)
        `)
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (booking: Booking) => {
    if (!booking.cars) {
      toast({ title: "No car details available" });
      return;
    }
    setSelectedCar(booking.cars);
    setDetailsOpen(true);
  };

  const handleCancelBooking = () => {
    toast({
      title: "Cancellation requested",
      description: "Your cancellation request has been noted. Our team will contact you shortly.",
    });
    setDetailsOpen(false);
  };

  const currentBookings = bookings.filter(
    (booking) => !isPast(parseISO(booking.end_date))
  );
  const pastBookings = bookings.filter((booking) =>
    isPast(parseISO(booking.end_date))
  );

  const BookingCard = ({ booking, clickable = false }: { booking: Booking; clickable?: boolean }) => (
    <div
      className={`border rounded-lg p-4 space-y-3 bg-card transition-all ${
        clickable ? "cursor-pointer hover:border-primary hover:shadow-md" : ""
      }`}
      onClick={clickable ? () => handleCardClick(booking) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            {booking.cars?.image_url ? (
              <img src={booking.cars.image_url} alt={booking.cars?.name} className="h-full w-full object-cover" />
            ) : (
              <Car className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{booking.cars?.name || "Vehicle"}</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {booking.item_type || "Car Rental"}
            </p>
          </div>
        </div>
        <Badge
          variant={
            booking.payment_status === "completed"
              ? "default"
              : booking.payment_status === "pending"
              ? "secondary"
              : "outline"
          }
        >
          {booking.payment_status || "Pending"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(parseISO(booking.start_date), "MMM d")} -{" "}
            {format(parseISO(booking.end_date), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{booking.pickup_location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm text-muted-foreground">Total Amount</span>
        <span className="font-semibold text-primary">
          {formatPrice(booking.total_amount)}
        </span>
      </div>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Bookings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              Current Bookings ({currentBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Bookings ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : currentBookings.length > 0 ? (
                <div className="space-y-4">
                  {currentBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No current bookings. Book your next adventure!" />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : pastBookings.length > 0 ? (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No past bookings yet." />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BookingsModal;
