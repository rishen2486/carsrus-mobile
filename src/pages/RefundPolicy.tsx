import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Refund & Cancellation Policy</h1>

        <h2 className="text-xl font-semibold text-foreground mb-3">Cancellations</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Free cancellation up to 24 hours before booking</li>
          <li>Late cancellations may incur charges</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Refunds</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Refunds are processed within 5–10 business days</li>
          <li>No refunds for no-shows</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Early Returns</h2>
        <p className="text-muted-foreground mb-6">
          No partial refunds will be provided for early vehicle returns unless agreed.
        </p>

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

export default RefundPolicy;
