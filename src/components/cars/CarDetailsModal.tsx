import { X, Users, Gauge, Fuel, Briefcase, MapPin, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CarDetailsModalProps {
  car: any | null;
  open: boolean;
  onClose: () => void;
  onBookNow: () => void;
  actionLabel?: string;
  actionVariant?: "premium" | "destructive" | "default";
  totalAmount?: number;
  totalLabel?: string;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976688153-9c302e0e1271?w=1200&h=800&fit=crop";

const CarDetailsModal = ({
  car,
  open,
  onClose,
  onBookNow,
  actionLabel = "Book Now",
  actionVariant = "premium",
  totalAmount,
  totalLabel = "Total Paid",
}: CarDetailsModalProps) => {
  const { formatPrice } = useCurrency();

  if (!open || !car) return null;

  const photos: string[] =
    (car.photos && car.photos.length > 0
      ? car.photos
      : car.image_url
      ? [car.image_url]
      : car.image
      ? [car.image]
      : [FALLBACK_IMG]) ?? [FALLBACK_IMG];

  const displayPrice =
    car.price_publish ||
    (car.price_per_day ? car.price_per_day + 100 : car.pricePerDay ? car.pricePerDay + 100 : 199);

  const features: string[] = car.features || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${car.name} details`}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-card rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-background/90 hover:bg-background border border-border shadow-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Photo carousel */}
        <div className="relative bg-muted">
          <Carousel className="w-full">
            <CarouselContent>
              {photos.map((src, i) => (
                <CarouselItem key={i}>
                  <img
                    src={src}
                    alt={`${car.name} - photo ${i + 1}`}
                    className="w-full h-72 md:h-96 object-cover rounded-t-2xl"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">{car.name}</h2>
              {car.brand && (
                <p className="text-muted-foreground mt-1">{car.brand}</p>
              )}
              {car.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {car.location}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(displayPrice)}
                <span className="text-base font-normal text-muted-foreground">/day</span>
              </div>
              {car.rating && (
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{car.rating}</span>
                  {car.reviews && (
                    <span className="text-xs text-muted-foreground">({car.reviews})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(car.seats || car.passengers) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Seats</div>
                  <div className="font-semibold">{car.seats || car.passengers}</div>
                </div>
              </div>
            )}
            {car.transmission && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Gauge className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Transmission</div>
                  <div className="font-semibold">{car.transmission}</div>
                </div>
              </div>
            )}
            {(car.fuel_type || car.fuel) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Fuel className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Fuel</div>
                  <div className="font-semibold">{car.fuel_type || car.fuel}</div>
                </div>
              </div>
            )}
            {(car.large_bags !== undefined || car.small_bags !== undefined) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Bags</div>
                  <div className="font-semibold">
                    {(car.large_bags ?? 0)} L / {(car.small_bags ?? 0)} S
                  </div>
                </div>
              </div>
            )}
          </div>

          {car.mileage && (
            <div className="text-sm">
              <span className="font-medium">Mileage: </span>
              <span className="text-muted-foreground">{car.mileage}</span>
            </div>
          )}

          {car.description && (
            <div>
              <h3 className="font-semibold mb-2">About this car</h3>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>
          )}

          {features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <Badge key={i} variant="outline">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            variant={actionVariant}
            size="lg"
            className="w-full text-lg"
            onClick={() => {
              onClose();
              onBookNow();
            }}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;
