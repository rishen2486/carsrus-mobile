"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddCarModalProps {
  onClose: () => void;
}

export default function AddCarModal({ onClose }: AddCarModalProps) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    seats: "",
    transmission: "",
    fuel_type: "",
    price_per_day: "",
    deposit_amount: "",
    mileage: "",
    price_per_km: "",
    large_bags: "",
    small_bags: "",
    description: "",
    image_url: "",
    features: "",
    country: "Mauritius",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add cars");
        return;
      }

      // Upload photos
      const uploadedUrls: string[] = [];
      for (const file of photos) {
        const filePath = `cars/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("car-images")
          .upload(filePath, file);

        if (error) {
          console.error("Upload error:", error);
          continue;
        }

        const publicUrl = supabase.storage
          .from("car-images")
          .getPublicUrl(data.path).data.publicUrl;

        uploadedUrls.push(publicUrl);
      }

      const { error } = await supabase.from("cars").insert([
        {
          name: form.name,
          brand: form.brand,
          seats: form.seats ? parseInt(form.seats) : null,
          transmission: form.transmission || null,
          fuel_type: form.fuel_type || null,
          price_per_day: form.price_per_day ? parseFloat(form.price_per_day) : null,
          deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
          mileage: form.mileage || null,
          price_per_km: form.price_per_km ? parseFloat(form.price_per_km) : null,
          large_bags: form.large_bags ? parseInt(form.large_bags) : 0,
          small_bags: form.small_bags ? parseInt(form.small_bags) : 0,
          description: form.description || null,
          image_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
          photos: uploadedUrls.length > 0 ? uploadedUrls : null,
          features: form.features ? form.features.split(",").map(f => f.trim()) : null,
          country: form.country,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Error adding car:", error.message);
        toast.error("Failed to add car: " + error.message);
        return;
      }

      toast.success("Car added successfully!");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Add Car</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Car Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Honda Civic"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              name="brand"
              placeholder="e.g. Honda"
              value={form.brand}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                placeholder="5"
                value={form.seats}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 bg-background text-foreground"
              >
                <option value="">Select</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="fuel_type">Fuel Type</Label>
            <select
              name="fuel_type"
              value={form.fuel_type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-background text-foreground"
            >
              <option value="">Select</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="price_per_day">Price per Day (Rs)</Label>
            <Input
              id="price_per_day"
              name="price_per_day"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={form.price_per_day}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="deposit_amount">Deposit Amount (Rs)</Label>
            <Input
              id="deposit_amount"
              name="deposit_amount"
              type="number"
              step="0.01"
              placeholder="5000.00"
              value={form.deposit_amount}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="large_bags">Large Bags</Label>
              <Input
                id="large_bags"
                name="large_bags"
                type="number"
                placeholder="2"
                value={form.large_bags}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="small_bags">Small Bags</Label>
              <Input
                id="small_bags"
                name="small_bags"
                type="number"
                placeholder="1"
                value={form.small_bags}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="mileage">Mileage (Max Mileage to customers)</Label>
            <Input
              id="mileage"
              name="mileage"
              placeholder="e.g. 200km/day or Unlimited Mileage"
              value={form.mileage}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="price_per_km">Price per km (Rs) for Excess Mileage</Label>
            <Input
              id="price_per_km"
              name="price_per_km"
              type="number"
              step="0.01"
              placeholder="10.00"
              value={form.price_per_km}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 bg-background text-foreground"
            >
              <option value="Mauritius">Mauritius</option>
              <option value="Rodrigues">Rodrigues</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input
              id="features"
              name="features"
              placeholder="Air Conditioning, GPS, Bluetooth"
              value={form.features}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="photos">Photos (up to 5 images)</Label>
            <Input
              id="photos"
              name="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {photos.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {photos.length} file(s) selected
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the car..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}