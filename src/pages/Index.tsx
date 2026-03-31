import { useState, useEffect } from "react";
import { ArrowRight, Star, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchBar, { SearchFilters } from "@/components/search/SearchBar";
import CarCard from "@/components/cars/CarCard";
import { BookingForm } from "@/components/BookingForm";
import Navbar from "@/components/layout/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Car {
  id: string;
  name: string;
  image_url?: string;
  price_per_day: number;
  description: string;
  features?: string[];
  available: boolean;
  brand?: string;
  seats?: number;
  transmission?: string;
  country?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("Mauritius");
  const { toast } = useToast();

  // Fetch all cars
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('available', true);

        if (error) {
          console.error('Error fetching cars:', error);
          toast({
            title: "Error loading cars",
            description: "Could not load featured cars. Please try again.",
            variant: "destructive",
          });
        } else {
          setFeaturedCars(data || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading cars.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, [toast]);

  const handleSearch = (filters: SearchFilters) => {
    // Navigate to Cars page with filters as query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/cars?${params.toString()}`);
  };

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setIsBookingFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Car Rental
            <span className="block text-white">
              Made Simple
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Discover our premium fleet of vehicles and enjoy the freedom of the road. 
            From luxury sedans to spacious SUVs, find your perfect ride.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-5xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="premium" className="text-lg px-8 py-6" asChild>
              <Link to="/cars">
                Browse All Cars
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Vehicles
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Explore our handpicked selection of premium vehicles
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className={cn("px-8", selectedCountry === "Mauritius" ? "" : "bg-primary/20 text-primary hover:bg-primary/30")}
                onClick={() => setSelectedCountry("Mauritius")}
              >
                Mauritius
              </Button>
              <Button
                size="lg"
                className={cn("px-8", selectedCountry === "Rodrigues" ? "" : "bg-primary/20 text-primary hover:bg-primary/30")}
                onClick={() => setSelectedCountry("Rodrigues")}
              >
                Rodrigues
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-lg">Loading featured cars...</p>
              </div>
            ) : featuredCars.filter(car => car.country === selectedCountry).length > 0 ? (
              featuredCars.filter(car => car.country === selectedCountry).map((car) => (
                <CarCard key={car.id} car={car} onBookNow={() => handleBookNow(car)} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No cars available in {selectedCountry} at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link to="/cars">
                View All Cars
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CarsRus Rental?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience premium car rental with unmatched service and quality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Star,
                title: "Premium Fleet",
                description: "Top-quality vehicles from leading brands, meticulously maintained for your comfort."
              },
              {
                icon: Shield,
                title: "Fully Insured",
                description: "Comprehensive insurance coverage and 24/7 roadside assistance for peace of mind."
              },
              {
                icon: Clock,
                title: "Instant Booking",
                description: "Book your perfect car in minutes with our streamlined reservation system."
              },
              {
                icon: Users,
                title: "Expert Support",
                description: "Professional customer service team ready to assist you every step of the way."
              }
            ].map((feature, index) => (
              <Card key={index} className="luxury-card text-center p-6">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Hit the Road?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied customers who trust CarsRus Rental for their transportation needs.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6" asChild>
            <Link to="/cars">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Booking Form Modal */}
      <Dialog open={isBookingFormOpen} onOpenChange={setIsBookingFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Your Car</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <BookingForm 
              car={selectedCar} 
              onClose={() => setIsBookingFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
