import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, LogIn, MailCheck, UserPlus } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  sendSignupVerification,
  validatePhoneNumber,
  verifySignupOtp,
} from '@/lib/auth/signupVerification';

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

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setStep('signup');
      setOtp('');
    }
  }, [isOpen]);

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

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.phone) {
      toast({
        title: 'Missing Details',
        description: 'Please complete all signup fields before continuing.',
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(signupData.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid international phone number (e.g., +230xxxxxxxx).',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.searchParams.set('auth_verified', '1');

      await sendSignupVerification({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        telephoneNumber: signupData.phone,
        redirectTo: redirectUrl.toString(),
      });

      toast({
        title: "OTP Sent",
        description: "Check your email for the OTP code and the magic link.",
      });

      setStep("otp");
      setOtp('');

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send OTP",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // =========================
  // VERIFY OTP → CREATE USER
  // =========================
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await verifySignupOtp({
        email: signupData.email,
        otp,
        name: signupData.name,
        telephoneNumber: signupData.phone,
      });

      toast({
        title: "Success",
        description: "Account created and verified successfully!",
      });

      onAuthenticated();

    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "OTP verification failed",
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
              <Input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData(p => ({ ...p, email: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData(p => ({ ...p, password: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup">

            {step === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <Input
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData(p => ({ ...p, name: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(p => ({ ...p, email: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={signupData.phone}
                  onChange={(e) => setSignupData(p => ({ ...p, phone: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </span>
                  ) : 'Create Account & Continue'}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-4 pt-2">
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <MailCheck className="mt-0.5 h-5 w-5 text-primary" />
                    <p>
                      We sent a 6-digit OTP and a magic link to <span className="font-medium text-foreground">{signupData.email}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button onClick={handleVerifyOtp} className="w-full" disabled={loading || otp.trim().length !== 6}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : "Verify OTP & Create Account"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSignup({ preventDefault: () => {} } as React.FormEvent)}
                  className="w-full"
                  disabled={loading}
                >
                  Resend OTP & Magic Link
                </Button>
                <Button variant="ghost" onClick={() => setStep("signup")} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
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
