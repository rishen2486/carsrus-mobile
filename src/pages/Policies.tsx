import Navbar from "@/components/layout/Navbar";

const Policies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-10 text-center">Carsrus Rental – Policies</h1>

        {/* 1. Privacy & Data Protection */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">1. Privacy & Data Protection Policy</h2>
          <p className="text-muted-foreground mb-4">
            Carsrus Ltd ("we", "our", "us") is committed to protecting your personal data.
            This policy explains how we collect, use, and safeguard your information.
          </p>

          <h3 className="text-lg font-medium text-foreground mb-2">Information We Collect</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Full name, contact number, and email address</li>
            <li>Driver's license and identification details</li>
            <li>Payment information</li>
            <li>Booking and rental history</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">How We Use Your Data</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>To process bookings and payments</li>
            <li>To communicate booking confirmations and updates</li>
            <li>To improve our services</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">Data Security</h3>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational measures to protect your data.
          </p>

          <h3 className="text-lg font-medium text-foreground mb-2">Third Parties</h3>
          <p className="text-muted-foreground">
            We may share data with payment providers and legal authorities where required.
          </p>
        </section>

        <hr className="border-border mb-10" />

        {/* 2. Terms & Conditions */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">2. Terms & Conditions</h2>
          <p className="text-muted-foreground mb-4">
            By using Carsrus Rental services, you agree to the following terms:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>You must hold a valid driver's license</li>
            <li>You must be at least 21 years old (or as required by law)</li>
            <li>You are responsible for the vehicle during the rental period</li>
            <li>Vehicles must be returned in the same condition</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">Prohibited Use</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Driving under the influence</li>
            <li>Unauthorized drivers</li>
            <li>Using the vehicle for illegal activities</li>
          </ul>
        </section>

        <hr className="border-border mb-10" />

        {/* 3. Refund & Cancellation Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">3. Refund & Cancellation Policy</h2>

          <h3 className="text-lg font-medium text-foreground mb-2">Cancellations</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Free cancellation up to 24 hours before booking</li>
            <li>Late cancellations may incur charges</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">Refunds</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Refunds are processed within 5–10 business days</li>
            <li>No refunds for no-shows</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">Early Returns</h3>
          <p className="text-muted-foreground">
            No partial refunds will be provided for early vehicle returns unless agreed.
          </p>
        </section>

        <hr className="border-border mb-10" />

        {/* 4. Booking & Rental Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">4. Booking & Rental Policy</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Bookings are confirmed only after payment is received</li>
            <li>A security deposit may be required</li>
            <li>Fuel policy: return with same level as received</li>
            <li>Late returns may incur additional charges</li>
          </ul>
        </section>

        <hr className="border-border mb-10" />

        {/* 5. Cookie Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">5. Cookie Policy</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies to enhance user experience and analyze website traffic.
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Essential cookies for site functionality</li>
            <li>Analytics cookies for performance tracking</li>
          </ul>
          <p className="text-muted-foreground">
            By using our website, you consent to the use of cookies.
          </p>
        </section>

        <hr className="border-border mb-10" />

        {/* 6. Contact Us */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-3">6. Contact Us</h2>
          <p className="text-muted-foreground">
            Carsrus Ltd<br />
            Email: support@carsrus.com<br />
            Phone: +230 XXX XXXX
          </p>
        </section>
      </div>
    </div>
  );
};

export default Policies;
