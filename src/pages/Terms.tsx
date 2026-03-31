import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms & Conditions</h1>

        <p className="text-muted-foreground mb-6">
          By using Carsrus Rental services, you agree to the following terms:
        </p>

        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>You must hold a valid driver's license</li>
          <li>You must be at least 21 years old (or as required by law)</li>
          <li>You are responsible for the vehicle during the rental period</li>
          <li>Vehicles must be returned in the same condition</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Prohibited Use</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Driving under the influence</li>
          <li>Unauthorized drivers</li>
          <li>Using the vehicle for illegal activities</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Booking & Rental Policy</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Bookings are confirmed only after payment is received</li>
          <li>A security deposit may be required</li>
          <li>Fuel policy: return with same level as received</li>
          <li>Late returns may incur additional charges</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
        <p className="text-muted-foreground">
          Carsrus Ltd<br />
          Email: support@carsrus.com<br />
          Phone: +230 XXX XXXX
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
