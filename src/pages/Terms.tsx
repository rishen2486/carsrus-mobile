import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms & Conditions</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Carsrus ("Carsrus", "we", "us", or "our"). These Terms & Conditions ("Terms") govern your access to and use of the Carsrus platform, including our website and services (collectively, the "Platform").
          </p>
          <p className="text-muted-foreground mt-2">
            By using the Platform, you agree to be bound by these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Nature of the Platform</h2>
          <p className="text-muted-foreground mb-2">
            Carsrus is a digital marketing and booking platform that enables independent vehicle owners ("Vehicle Owners") to advertise their vehicles and receive booking requests from customers ("Users").
          </p>
          <p className="text-muted-foreground mb-2">
            Carsrus does not own, lease, manage, or operate any vehicles listed on the Platform.
          </p>
          <p className="text-muted-foreground mb-2">
            Carsrus acts solely as a commercial agent on behalf of Vehicle Owners to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-2 space-y-1">
            <li>Promote vehicle listings</li>
            <li>Facilitate booking requests</li>
            <li>Facilitate payment collection where applicable</li>
          </ul>
          <p className="text-muted-foreground">
            Carsrus is not a car rental company and does not provide transportation or rental services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Rental Agreement</h2>
          <p className="text-muted-foreground mb-2">
            All rental agreements are entered into directly between the User and the Vehicle Owner.
          </p>
          <p className="text-muted-foreground mb-2">
            Carsrus is not a party to any rental agreement and does not assume any responsibility arising from such agreements.
          </p>
          <p className="text-muted-foreground mb-2">The Vehicle Owner is solely responsible for:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Providing the vehicle</li>
            <li>Ensuring vehicle roadworthiness and legal compliance</li>
            <li>Insurance coverage</li>
            <li>Delivery and collection of the vehicle</li>
            <li>Handling customer service, disputes, and claims</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Bookings</h2>
          <p className="text-muted-foreground mb-2">When a User submits a booking request through the Platform:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-2 space-y-1">
            <li>The request is transmitted to the Vehicle Owner</li>
            <li>The Vehicle Owner has full discretion to accept or reject the booking</li>
          </ul>
          <p className="text-muted-foreground">
            A booking is only confirmed once accepted by the Vehicle Owner.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Payments</h2>

          <h3 className="text-lg font-medium text-foreground mb-2">5.1 Role of Carsrus</h3>
          <p className="text-muted-foreground mb-2">
            Carsrus may facilitate the collection of payments as a commercial agent on behalf of the Vehicle Owner.
          </p>
          <p className="text-muted-foreground mb-4">
            Carsrus does not act as the principal seller of rental services and does not treat customer payments as its own revenue.
          </p>

          <h3 className="text-lg font-medium text-foreground mb-2">5.2 Payment Processing</h3>
          <p className="text-muted-foreground mb-2">
            Payments are processed through a third-party payment provider. Funds collected are:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Held and processed in accordance with the payment provider's procedures</li>
            <li>Intended for the Vehicle Owner, subject to applicable fees</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mb-2">5.3 Commission</h3>
          <p className="text-muted-foreground">
            Carsrus earns a commission for providing platform and marketing services. This commission is deducted from the total booking amount before settlement to the Vehicle Owner.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Cancellations & Refunds</h2>
          <p className="text-muted-foreground mb-2">
            Cancellation and refund policies are determined by the Vehicle Owner and may vary between listings.
          </p>
          <p className="text-muted-foreground">
            Carsrus may assist in facilitating refunds but is not responsible for refund decisions, which remain at the discretion of the Vehicle Owner unless otherwise required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">7. User Responsibilities</h2>
          <p className="text-muted-foreground mb-2">Users agree to:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-2 space-y-1">
            <li>Provide accurate and complete information</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Adhere to the terms of the rental agreement with the Vehicle Owner</li>
          </ul>
          <p className="text-muted-foreground mb-2">Users are responsible for:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Proper use of the vehicle</li>
            <li>Returning the vehicle in agreed condition</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Vehicle Owner Responsibilities</h2>
          <p className="text-muted-foreground mb-2">Vehicle Owners agree to:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-2 space-y-1">
            <li>Provide accurate vehicle information</li>
            <li>Maintain valid insurance and licenses</li>
            <li>Comply with all legal and regulatory requirements</li>
            <li>Honor confirmed bookings</li>
          </ul>
          <p className="text-muted-foreground">
            Vehicle Owners are solely responsible for all services provided to Users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Liability Disclaimer</h2>
          <p className="text-muted-foreground mb-2">Carsrus shall not be liable for:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-2 space-y-1">
            <li>Any loss, damage, or injury arising from the rental or use of vehicles</li>
            <li>Vehicle condition, availability, or performance</li>
            <li>Actions or omissions of Vehicle Owners or Users</li>
          </ul>
          <p className="text-muted-foreground">
            Carsrus provides the Platform on an "as is" basis without warranties of any kind.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">10. Disputes</h2>
          <p className="text-muted-foreground mb-2">
            Any disputes arising from a rental must be resolved directly between the User and the Vehicle Owner.
          </p>
          <p className="text-muted-foreground">
            Carsrus may, at its discretion, assist in facilitating communication but is not obligated to resolve disputes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">11. Fees</h2>
          <p className="text-muted-foreground">
            Carsrus reserves the right to charge service fees to Users and/or commission fees to Vehicle Owners. All applicable fees will be clearly disclosed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">12. Termination</h2>
          <p className="text-muted-foreground mb-2">
            Carsrus may suspend or terminate access to the Platform at its discretion for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Breach of these Terms</li>
            <li>Fraudulent or abusive behavior</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">13. Data Protection</h2>
          <p className="text-muted-foreground">
            Carsrus processes personal data in accordance with applicable data protection laws and its Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">14. Amendments</h2>
          <p className="text-muted-foreground">
            Carsrus reserves the right to update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">15. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms shall be governed by and interpreted in accordance with the laws of Mauritius.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">16. Contact</h2>
          <p className="text-muted-foreground">
            For any questions, please contact:<br />
            Carsrus Ltd<br />
            Royal Road, Ripailles, St Pierre<br />
            <a href="mailto:carsrus88@gmail.com" className="text-primary hover:underline">carsrus88@gmail.com</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
