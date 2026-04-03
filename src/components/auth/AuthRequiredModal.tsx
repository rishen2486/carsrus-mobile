import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  // ✅ NEW STATE FOR OTP FLOW
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [otp, setOtp] = useState('');

  // =========================
  // LOGIN (UNCHANGED)
  // =========================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Signed in successfully!" });
        onAuthenticated();
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
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
      const res = await fetch(https://pjxhbjaqtwjmbqfpurcp.supabase.co/functions/v1/otp-handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          email: signupData.email,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });

      setStep("otp"); // ✅ switch to OTP UI

    } catch (err: any) {
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
      const res = await fetch("/functions/v1/otp-handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          email: signupData.email,
          otp,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Invalid OTP");
      }

      // ✅ NOW create user
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
            <TabsTrigger value="signin" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Sign Up
            </TabsTrigger>
          </TabsList>

          {/* ========================= */}
          {/* SIGN IN (UNCHANGED) */}
          {/* ========================= */}
          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* ========================= */}
          {/* SIGN UP WITH OTP */}
          {/* ========================= */}
          <TabsContent value="signup">

            {step === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    value={signupData.phone}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+230 5XXX XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Create Account & Continue'}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP & Create Account"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("signup")}
                >
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
