import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
];

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? colors[strength - 1] : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[strength - 1] || 'Too short'}</p>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ['Account', 'Company', 'Done'];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              i < current
                ? 'bg-success text-success-foreground'
                : i === current
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`hidden text-sm sm:inline ${i === current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </span>
          {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );
}

export default function Signup() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  const validateStep1 = () => {
    if (!fullName.trim()) { toast({ variant: 'destructive', title: 'Full name is required' }); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast({ variant: 'destructive', title: 'Enter a valid email' }); return false; }
    if (password.length < 8) { toast({ variant: 'destructive', title: 'Password must be at least 8 characters' }); return false; }
    if (password !== confirmPassword) { toast({ variant: 'destructive', title: 'Passwords do not match' }); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!companyName.trim()) { toast({ variant: 'destructive', title: 'Company name is required' }); return false; }
    if (gstin && !GSTIN_REGEX.test(gstin.toUpperCase())) { toast({ variant: 'destructive', title: 'Invalid GSTIN format' }); return false; }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) { toast({ variant: 'destructive', title: 'Enter a valid 10-digit phone number' }); return false; }
    if (pincode && !/^\d{6}$/.test(pincode)) { toast({ variant: 'destructive', title: 'Enter a valid 6-digit pincode' }); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && validateStep1()) setStep(1);
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
            phone: phone.trim(),
            gstin: gstin.trim().toUpperCase(),
            address: address.trim(),
            city: city.trim(),
            state,
            pincode: pincode.trim(),
          },
        },
      });
      if (error) throw error;
      setStep(2);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: err?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-lg shadow-card-hover border-border/50">
        <CardHeader className="items-center space-y-4 pb-2">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              AuditEase <span className="text-gradient">AI</span>
            </span>
          </Link>
          <StepIndicator current={step} />
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input id="signupEmail" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button variant="hero" className="w-full gap-2" onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary/80">Log in</Link>
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Company Details</h2>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" placeholder="Acme Logistics Pvt Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (optional)</Label>
                <Input id="gstin" placeholder="22AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" placeholder="400001" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} maxLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={handleSignup} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-10 w-10 text-success animate-fade-in" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Account Created!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Please check your email to verify your account. Our team will review and activate your account within 24 hours.
                </p>
              </div>
              <Link to="/login">
                <Button variant="hero" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
