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
import { supabase } from '@/integrations/supabase/client';

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
    try {
      // Rate limit check (3 submissions per 30 minutes per email)
      const { data: allowed } = await supabase.rpc('check_rate_limit', {
        p_identifier: formData.email.trim().toLowerCase(),
        p_action: 'contact_form',
        p_max_attempts: 3,
        p_window_minutes: 30,
      });
      if (allowed === false) {
        toast({
          variant: 'destructive',
          title: 'Too many submissions',
          description: 'Please wait before submitting again.',
        });
        setLoading(false);
        return;
      }

      // Always save to Supabase (primary persistence)
      const leadPayload = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        monthly_shipments: formData.monthlyShipments,
        message: formData.message,
        source: 'contact_form'
      };

      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .ilike('email', formData.email.trim())
        .maybeSingle();

      if (existingLead) {
        const { error } = await supabase
          .from('leads')
          .update({
            name: formData.name,
            company: formData.company,
            phone: formData.phone,
            monthly_shipments: formData.monthlyShipments,
            message: formData.message,
          })
          .eq('id', existingLead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leads').insert(leadPayload);
        if (error) throw error;
      }

      // Also send to n8n webhook (fire and forget)
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_CONTACT || '';
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload)
        }).catch(() => {}); // Don't block UI if webhook fails
      }

      toast({ title: '✅ Thank you!', description: 'We will contact you within 24 hours.' });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
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
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder=""
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder=""
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder=""
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    autoComplete="off"
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
