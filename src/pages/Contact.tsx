import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    monthlyShipments: '',
    message: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.company || !formData.monthlyShipments) {
      toast({ variant: 'destructive', title: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: '✅ Request Submitted!',
      description: 'Our team will contact you within 24 hours.',
    });

    setLoading(false);
    navigate('/');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-card-hover">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AuditEase AI</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Request a Demo</h1>
            <p className="text-muted-foreground text-sm mt-1">
              See how we can help you recover logistics costs
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Monthly Shipments *</Label>
                <Select
                  value={formData.monthlyShipments}
                  onValueChange={(value) => updateField('monthlyShipments', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lt1000">Less than 1,000</SelectItem>
                    <SelectItem value="1000-5000">1,000 - 5,000</SelectItem>
                    <SelectItem value="5000-20000">5,000 - 20,000</SelectItem>
                    <SelectItem value="20000-50000">20,000 - 50,000</SelectItem>
                    <SelectItem value="gt50000">More than 50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your logistics challenges..."
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Request Demo
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to our{' '}
                <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
