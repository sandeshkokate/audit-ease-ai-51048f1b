import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SEOHead from '@/components/shared/SEOHead';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const { toast } = useToast();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({ variant: 'destructive', title: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    try {
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

      const { error } = await supabase.from('leads').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || null,
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
        source: 'contact_form',
      });
      if (error) throw error;

      toast({ title: 'Message sent!', description: 'We will get back to you within 24 hours.' });
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again or email support@auditeasetechnologies.com',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Contact Us – AuditEase | Get a Free Courier Audit"
        description="Have questions about courier billing audits? Contact AuditEase. We respond within 24 hours."
        path="/contact"
      />
      <LandingNav />

      <main className="flex-1 container mx-auto max-w-xl px-4 py-16 md:py-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Get in Touch</h1>
          <p className="mt-2 text-muted-foreground">
            We respond within 24 hours by email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              rows={5}
              required
            />
          </div>

          <Button type="submit" variant="hero" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Or email us directly:{' '}
          <a href="mailto:support@auditease.com" className="text-primary hover:underline">
            support@auditease.com
          </a>
        </p>
      </main>

      <LandingFooter />
    </div>
  );
}
