import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import Tours from "./pages/Tours";
import Attractions from "./pages/Attractions";
import Dashboard from "./pages/admin/Dashboard";
import AddCar from "./pages/admin/AddCar";
import CarList from "./pages/admin/CarList";
import EditCar from "./pages/admin/EditCar";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/add-car" element={<AddCar />} />
        <Route path="/admin/cars" element={<CarList />} />
        <Route path="/admin/edit-car/:id" element={<EditCar />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/booking/:id/confirmation" element={<BookingConfirmation />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
