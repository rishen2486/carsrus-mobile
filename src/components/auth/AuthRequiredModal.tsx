import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AuthRequiredModal({ isOpen, onClose, onAuthenticated }: AuthRequiredModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', phone: '' });

  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [otp, setOtp] = useState('');

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Signed in successfully!" });
      onAuthenticated();

    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // =========================
  // SIGNUP → SEND OTP
  // =========================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      console.log("🚀 Sending OTP...");
      console.log("API KEY:", API_KEY);

      const res = await fetch(
        "https://pjxhbjaqtwjmbqfpurcp.supabase.co/functions/v1/otp-handler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
            "apikey": API_KEY, // ✅ CRITICAL FIX
          },
          body: JSON.stringify({
            action: "send",
            email: signupData.email,
          }),
        }
      );

      const data = await res.json();
      console.log("OTP RESPONSE:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });

      setStep("otp");

    } catch (err: any) {
      console.error("❌ SEND OTP ERROR:", err);

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // =========================
  // VERIFY OTP → CREATE USER
  // =========================
  const handleVerifyOtp = async () => {
    setLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      console.log("🔐 Verifying OTP...");

      const res = await fetch(
        "https://pjxhbjaqtwjmbqfpurcp.supabase.co/functions/v1/otp-handler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
            "apikey": API_KEY, // ✅ CRITICAL FIX
          },
          body: JSON.stringify({
            action: "verify",
            email: signupData.email,
            otp: otp.trim(),
          }),
        }
      );

      const data = await res.json();
      console.log("VERIFY RESPONSE:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP");
      }

      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            full_name: signupData.name,
            telephone_number: signupData.phone,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      onAuthenticated();

    } catch (err: any) {
      console.error("❌ VERIFY ERROR:", err);

      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign In Required</DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Please sign in or create an account to complete your booking.
          </p>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">
              <LogIn className="h-4 w-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup">
              <UserPlus className="h-4 w-4" /> Sign Up
            </TabsTrigger>
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <Input type="email" value={loginData.email}
                onChange={(e) => setLoginData(p => ({ ...p, email: e.target.value }))} placeholder="Email" required />
              <Input type="password" value={loginData.password}
                onChange={(e) => setLoginData(p => ({ ...p, password: e.target.value }))} placeholder="Password" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup">

            {step === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <Input value={signupData.name}
                  onChange={(e) => setSignupData(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" required />
                <Input type="email" value={signupData.email}
                  onChange={(e) => setSignupData(p => ({ ...p, email: e.target.value }))} placeholder="Email" required />
                <Input value={signupData.phone}
                  onChange={(e) => setSignupData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                <Input type="password" value={signupData.password}
                  onChange={(e) => setSignupData(p => ({ ...p, password: e.target.value }))} placeholder="Password" required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Create Account & Continue'}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-4 pt-2">
                <Input value={otp}
                  onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
                <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP & Create Account"}
                </Button>
                <Button variant="ghost" onClick={() => setStep("signup")} className="w-full">
                  Go Back
                </Button>
              </div>
            )}

          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
