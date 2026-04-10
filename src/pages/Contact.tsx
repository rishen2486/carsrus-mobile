import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/contact/ContactSection";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Contact;
