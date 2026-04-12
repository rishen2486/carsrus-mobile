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

  // 🚀 NEW: cooldown to prevent spam
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setStep('signup');
      setOtp('');
      setResendCooldown(0);
    }
  }, [isOpen]);

  // countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

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
    if (loading) return;

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.phone) {
      toast({
        title: 'Missing Details',
        description: 'Please complete all signup fields.',
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(signupData.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Use format +230xxxxxxxx',
        variant: 'destructive',
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Minimum 6 characters.',
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
        description: "Check your email for OTP.",
      });

      setStep("otp");
      setOtp('');

      // 🚀 start cooldown (30 seconds)
      setResendCooldown(30);

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
  // VERIFY OTP
  // =========================
  const handleVerifyOtp = async () => {
    if (loading) return;

    if (otp.trim().length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Enter 6-digit code",
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
        description: "Account created successfully!",
      });

      onAuthenticated();

    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "OTP failed",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // =========================
  // RESEND OTP (SAFE)
  // =========================
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;

    await handleSignup({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign In Required</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin"><LogIn className="h-4 w-4" /> Sign In</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus className="h-4 w-4" /> Sign Up</TabsTrigger>
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <Input type="email" placeholder="Email" value={loginData.email}
                onChange={(e) => setLoginData(p => ({ ...p, email: e.target.value }))} />
              <Input type="password" placeholder="Password" value={loginData.password}
                onChange={(e) => setLoginData(p => ({ ...p, password: e.target.value }))} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup">
            {step === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <Input placeholder="Full Name" value={signupData.name}
                  onChange={(e) => setSignupData(p => ({ ...p, name: e.target.value }))} />
                <Input type="email" placeholder="Email" value={signupData.email}
                  onChange={(e) => setSignupData(p => ({ ...p, email: e.target.value }))} />
                <Input placeholder="Phone" value={signupData.phone}
                  onChange={(e) => setSignupData(p => ({ ...p, phone: e.target.value }))} />
                <Input type="password" placeholder="Password" value={signupData.password}
                  onChange={(e) => setSignupData(p => ({ ...p, password: e.target.value }))} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <div className="space-y-4 pt-2">
                <p className="text-sm text-center">
                  OTP sent to <b>{signupData.email}</b>
                </p>

                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <Button onClick={handleVerifyOtp} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="w-full"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
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
