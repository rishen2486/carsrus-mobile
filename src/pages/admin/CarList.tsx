import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Car, CalendarOff } from "lucide-react";
import BlockDatesModal from "@/components/admin/BlockDatesModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Car {
  id: string;
  name: string;
  brand: string;
  seats: number;
  transmission: string;
  large_bags: number;
  small_bags: number;
  mileage: string;
  price_per_day: number;
  description: string;
  photos: string[];
  available: boolean;
}

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [blockModalCar, setBlockModalCar] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if user is superuser
      const { data: profile } = await supabase
        .from("profiles")
        .select("superuser")
        .eq("user_id", user.id)
        .single();

      const isSuper = profile?.superuser || false;
      setIsSuperuser(isSuper);

      let query = supabase.from("cars").select("*");
      if (!isSuper) {
        query = query.eq("user_id", user.id);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      console.error("Error fetching cars:", error.message);
      toast({
        title: "Error",
        description: "Failed to load cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, carName: string) => {
    try {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;

      setCars(cars.filter((car) => car.id !== id));
      toast({
        title: "Car Deleted",
        description: `${carName} has been removed from your fleet.`,
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("cars")
        .update({ available: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setCars(cars.map(car => 
        car.id === id ? { ...car, available: !currentStatus } : car
      ));

      toast({
        title: "Availability Updated",
        description: `Car is now ${!currentStatus ? 'available' : 'unavailable'} for booking.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Cars</h1>
              <p className="text-muted-foreground">
                {isSuperuser ? "All cars" : "Your cars"} — {cars.length} car{cars.length !== 1 ? 's' : ''} in fleet
              </p>
            </div>
          </div>
          
          <Button asChild className="premium-button">
            <Link to="/admin/add-car">
              <Plus className="h-4 w-4 mr-2" />
              Add Car
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading cars...</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <Card className="luxury-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Car className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No cars found</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by adding your first car to the fleet.
              </p>
              <Button asChild>
                <Link to="/admin/add-car">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Car
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cars.map((car) => (
              <Card key={car.id} className="luxury-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Car Image */}
                    <div className="md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {car.photos && car.photos.length > 0 ? (
                        <img
                          src={car.photos[0]}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{car.name}</h3>
                            <Badge 
                              variant={car.available ? "default" : "secondary"}
                              className={car.available ? "bg-green-500" : ""}
                            >
                              {car.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{car.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${car.price_per_day}</p>
                          <p className="text-sm text-muted-foreground">per day</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seats:</span>
                          <span className="ml-1 font-medium">{car.seats}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transmission:</span>
                          <span className="ml-1 font-medium capitalize">{car.transmission}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bags:</span>
                          <span className="ml-1 font-medium">{car.large_bags}L / {car.small_bags}S</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mileage:</span>
                          <span className="ml-1 font-medium">{car.mileage}</span>
                        </div>
                      </div>

                      {car.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {car.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBlockModalCar({ id: car.id, name: car.name })}
                        >
                          <CalendarOff className="h-4 w-4 mr-2" />
                          Book Car
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/edit-car/${car.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        
                        <Button
                          variant={car.available ? "secondary" : "default"}
                          size="sm"
                          onClick={() => toggleAvailability(car.id, car.available)}
                        >
                          {car.available ? "Mark Unavailable" : "Mark Available"}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Car</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{car.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(car.id, car.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Block Dates Modal */}
      <BlockDatesModal
        open={!!blockModalCar}
        onOpenChange={(open) => !open && setBlockModalCar(null)}
        carId={blockModalCar?.id || ""}
        carName={blockModalCar?.name || ""}
      />
    </div>
  );
}