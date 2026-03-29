import { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        source: 'help_widget',
      });
      if (error) throw error;
      toast({ title: 'Message sent', description: 'We will get back to you within 24 hours.' });
      setForm({ name: '', email: '', message: '' });
      setShowForm(false);
      setOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to send', description: 'Please try again or use WhatsApp.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">Need help?</span>
            <button onClick={() => { setOpen(false); setShowForm(false); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!showForm ? (
            <>
              <a
                href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%20need%20help%20with%20AuditEase%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:support@auditease.ai"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors w-full text-left"
              >
                <Send className="h-4 w-4" />
                Send a Message
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-sm h-8"
                required
              />
              <Input
                type="email"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="text-sm h-8"
                required
              />
              <Textarea
                placeholder="How can we help?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="text-sm min-h-[60px]"
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowForm(false)}>
                  Back
                </Button>
                <Button type="submit" size="sm" className="text-xs flex-1" disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-button hover:scale-105 transition-transform"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
