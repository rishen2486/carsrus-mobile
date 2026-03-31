import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy & Data Protection Policy</h1>

        <p className="text-muted-foreground mb-6">
          Carsrus Ltd ("we", "our", "us") is committed to protecting your personal data.
          This policy explains how we collect, use, and safeguard your information.
        </p>

        <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>Full name, contact number, and email address</li>
          <li>Driver's license and identification details</li>
          <li>Payment information</li>
          <li>Booking and rental history</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Data</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
          <li>To process bookings and payments</li>
          <li>To communicate booking confirmations and updates</li>
          <li>To improve our services</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
        <p className="text-muted-foreground mb-6">
          We implement appropriate technical and organizational measures to protect your data.
        </p>

        <h2 className="text-xl font-semibold text-foreground mb-3">Third Parties</h2>
        <p className="text-muted-foreground mb-6">
          We may share data with payment providers and legal authorities where required.
        </p>

        <h2 className="text-xl font-semibold text-foreground mb-3">Cookie Policy</h2>
        <p className="text-muted-foreground mb-4">
          We use cookies to enhance user experience and analyze website traffic.
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
          <li>Essential cookies for site functionality</li>
          <li>Analytics cookies for performance tracking</li>
        </ul>
        <p className="text-muted-foreground mb-6">
          By using our website, you consent to the use of cookies.
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

export default PrivacyPolicy;
