import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CalendarOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { DateRange } from "react-day-picker";

interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  booking_id: string | null;
}

interface BlockDatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carName: string;
}

export default function BlockDatesModal({
  open,
  onOpenChange,
  carId,
  carName,
}: BlockDatesModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && carId) {
      fetchBlockedDates();
      setDateRange(undefined);
    }
  }, [open, carId]);

  const fetchBlockedDates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("car_availability")
        .select("*")
        .eq("car_id", carId)
        .order("start_date", { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error: any) {
      console.error("Error fetching blocked dates:", error);
      toast({
        title: "Error",
        description: "Failed to load blocked dates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Select dates",
        description: "Please select both a start and end date.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("car_availability").insert({
        car_id: carId,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast({
        title: "Dates Blocked",
        description: `${carName} is now blocked from ${format(dateRange.from, "dd MMM yyyy")} to ${format(dateRange.to, "dd MMM yyyy")}.`,
      });

      setDateRange(undefined);
      fetchBlockedDates();
    } catch (error: any) {
      console.error("Error blocking dates:", error);
      toast({
        title: "Error",
        description: "Failed to block dates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const { error } = await supabase
        .from("car_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBlockedDates((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Dates Unblocked",
        description: "The blocked dates have been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to unblock dates.",
        variant: "destructive",
      });
    }
  };

  // Collect all blocked date ranges into disabled matchers for the calendar
  const disabledDates = blockedDates.map((b) => ({
    from: new Date(b.start_date),
    to: new Date(b.end_date),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Block Dates — {carName}
          </DialogTitle>
          <DialogDescription>
            Select a date range to block this car from customer bookings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={[{ before: new Date() }, ...disabledDates]}
              numberOfMonths={1}
              className={cn("p-3 pointer-events-auto rounded-md border")}
            />
          </div>

          {/* Selected range display */}
          {dateRange?.from && (
            <div className="flex items-center justify-between bg-muted rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium">Selected: </span>
                {format(dateRange.from, "dd MMM yyyy")}
                {dateRange.to && ` → ${format(dateRange.to, "dd MMM yyyy")}`}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDateRange(undefined)}
              >
                Clear
              </Button>
            </div>
          )}

          <Button
            onClick={handleBlockDates}
            disabled={!dateRange?.from || !dateRange?.to || saving}
            className="w-full"
          >
            {saving ? "Blocking..." : "Block Selected Dates"}
          </Button>

          {/* Existing blocked dates */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Blocked Periods</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No dates are currently blocked for this car.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {blockedDates.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {format(new Date(block.start_date), "dd MMM yyyy")} →{" "}
                        {format(new Date(block.end_date), "dd MMM yyyy")}
                      </span>
                      {block.booking_id && (
                        <Badge variant="secondary" className="text-xs">
                          Booking
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleUnblock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
