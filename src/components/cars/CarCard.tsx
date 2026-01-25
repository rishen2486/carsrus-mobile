import { Star, Users, Fuel, Gauge, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CarCardProps {
  car: {
    id: string;
    name: string;
    category?: string;
    image?: string;
    image_url?: string;
    photos?: string[];
    rating?: number;
    reviews?: number;
    passengers?: number;
    transmission?: string;
    fuel?: string;
    pricePerDay?: number;
    price_per_day?: number;
    price_publish?: number;
    location?: string;
    features?: string[];
  };
  onBookNow?: () => void;
}

const CarCard = ({ car, onBookNow }: CarCardProps) => {
  const { formatPrice } = useCurrency();
  
  // Handle both old and new data structures - check photos array first, then image_url, then image
  const imageUrl = (car.photos && car.photos.length > 0 ? car.photos[0] : null) 
    || car.image_url 
    || car.image 
    || 'https://images.unsplash.com/photo-1494976688153-9c302e0e1271?w=800&h=600&fit=crop';
  const displayPrice = car.price_publish || (car.price_per_day ? car.price_per_day + 100 : car.pricePerDay ? car.pricePerDay + 100 : 199);
  const features = car.features || [];
  
  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    }
  };

  return (
    <Card className="car-card overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={car.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {car.category && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {car.category}
            </Badge>
          </div>
        )}
        {car.rating && car.reviews && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{car.rating}</span>
              <span className="text-xs text-muted-foreground">({car.reviews})</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {car.name}
            </h3>
            {car.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {car.location}
              </div>
            )}
          </div>

          {(car.passengers || car.transmission || car.fuel) && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {car.passengers && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{car.passengers} seats</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center gap-1">
                  <Gauge className="h-4 w-4" />
                  <span>{car.transmission}</span>
                </div>
              )}
              {car.fuel && (
                <div className="flex items-center gap-1">
                  <Fuel className="h-4 w-4" />
                  <span>{car.fuel}</span>
                </div>
              )}
            </div>
          )}

          {features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{features.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-left">
          <div className="text-2xl font-bold text-foreground">
            {formatPrice(displayPrice)}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </div>
        </div>
        <Button variant="premium" onClick={handleBookNow}>
          Book now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;