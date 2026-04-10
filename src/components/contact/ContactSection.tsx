import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "+230 ",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.subject || !form.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      if (error) throw error;
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ full_name: "", phone: "+230 ", email: "", subject: "", message: "" });
    } catch {
      toast({ title: "Failed to send message", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have a question or need assistance? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Column 1 — Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <p className="text-muted-foreground text-sm">+230 5503 3736 / +230 5797 0708</p>
                <p className="text-muted-foreground text-sm mt-1">Monday – Saturday, 8:00 AM – 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a href="mailto:carsrus88@outlook.com" className="text-primary hover:underline text-sm">
                  carsrus88@outlook.com
                </a>
                <p className="text-muted-foreground text-sm mt-1">We'll respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Address</h3>
                <p className="text-muted-foreground text-sm">CarsRus Ltd</p>
                <p className="text-muted-foreground text-sm">Poudrière Street, Port-Louis</p>
                <p className="text-muted-foreground text-sm">Mauritius</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                <p className="text-muted-foreground text-sm">Monday – Friday: 8:00 AM – 6:00 PM</p>
                <p className="text-muted-foreground text-sm">Saturday: 8:00 AM – 4:00 PM</p>
                <p className="text-muted-foreground text-sm">Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Column 2 — Contact Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="contact-name">Full Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  placeholder="+230 "
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email Address *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject *</Label>
                <Select value={form.subject} onValueChange={(v) => handleChange("subject", v)}>
                  <SelectTrigger id="contact-subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    <SelectItem value="Booking Support">Booking Support</SelectItem>
                    <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                    <SelectItem value="Fleet Information">Fleet Information</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Feedback">Feedback</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us how we can help you..."
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  maxLength={1000}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Column 3 — Map */}
          <div className="rounded-xl overflow-hidden border border-border shadow-sm min-h-[400px]">
            <iframe
              title="CarsRus Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3745.5!2d57.499!3d-20.162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x217c5073d7e4a3d%3A0x0!2sPoudri%C3%A8re%20Street%2C%20Port%20Louis%2C%20Mauritius!5e0!3m2!1sen!2smu!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 400 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
