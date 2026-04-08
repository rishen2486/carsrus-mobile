import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReCAPTCHA from 'react-google-recaptcha';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  buildRedirectUrl,
  ensureProfileFromUser,
  sendSignupVerification,
  validatePhoneNumber,
  verifySignupOtp,
} from '@/lib/auth/signupVerification';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasMagicLinkReturn =
      searchParams.get('verified') === 'magic-link' ||
      searchParams.has('code') ||
      window.location.hash.includes('access_token');

    let handled = false;

    const finishVerification = async (showSuccessToast: boolean) => {
      if (handled) {
        return;
      }

      handled = true;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        handled = false;
        return;
      }

      try {
        await ensureProfileFromUser(session.user);
      } catch (error) {
        console.error('Profile sync error:', error);
      }

      if (showSuccessToast) {
        toast({
          title: 'Email verified',
          description: 'Your account is now active and you are signed in.',
        });
      }

      navigate('/', { replace: true });
    };

    void finishVerification(hasMagicLinkReturn);

    if (!hasMagicLinkReturn) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void finishVerification(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const validateDetails = (requireRecaptcha: boolean) => {
    if (!name || !email || !password || !telephoneNumber) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return false;
    }

    if (!validatePhoneNumber(telephoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid international phone number (e.g., +230xxxxxxxx)',
        variant: 'destructive',
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return false;
    }

    if (requireRecaptcha && !recaptchaValue) {
      toast({
        title: 'reCAPTCHA Required',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSendVerification = async (requireRecaptcha: boolean) => {
    if (!validateDetails(requireRecaptcha)) {
      return;
    }

    setLoading(true);

    try {
      await sendSignupVerification({
        name,
        email,
        password,
        telephoneNumber,
        redirectTo: buildRedirectUrl('/signup?verified=magic-link'),
      });

      setStep('otp');
      setOtp('');

      toast({
        title: 'Verification email sent',
        description: 'We sent both a 6-digit OTP and a magic link to your email address.',
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Failed to send verification email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendVerification(true);
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await verifySignupOtp({
        email,
        otp,
        name,
        telephoneNumber,
      });

      recaptchaRef.current?.reset();
      setRecaptchaValue(null);

      toast({
        title: 'Account created',
        description: 'Your email has been verified and you are now signed in.',
      });

      navigate('/', { replace: true });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'The OTP code is invalid or expired.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {step === 'details' ? 'Create Account' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'details'
              ? 'Fill in your details to receive a verification OTP and magic link.'
              : 'Enter the 6-digit code we sent to your email, or use the magic link from the same message.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min 6 characters)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone Number *</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={telephoneNumber}
                  onChange={(e) => setTelephoneNumber(e.target.value)}
                  placeholder="+230 for Mauritius, +33 for France, etc."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +230 for Mauritius, +33 for France)
                </p>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={(value) => setRecaptchaValue(value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !recaptchaValue}
                variant="premium"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Verification...
                  </span>
                ) : (
                  'Send Verification Email'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <MailCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">Check {email}</p>
                    <p className="text-muted-foreground">
                      We sent you a 6-digit OTP and a magic link. Enter the OTP below if you want to verify directly on this page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="signup-otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    id="signup-otp"
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
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  className="w-full"
                  variant="premium"
                  disabled={loading || otp.trim().length !== 6}
                  onClick={handleVerifyOtp}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying OTP...
                    </span>
                  ) : (
                    'Verify OTP & Create Account'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleSendVerification(false)}
                >
                  Resend OTP & Magic Link
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={() => {
                    setStep('details');
                    setOtp('');
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to details
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}