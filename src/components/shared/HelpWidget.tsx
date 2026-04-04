import { useState } from 'react';
import { HelpCircle, Book, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  const helpItems = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Step-by-step guides and tutorials',
      action: () => window.open('https://docs.auditease.com', '_blank'),
    },
    {
      icon: MessageSquare,
      title: 'FAQs',
      description: 'Common questions answered',
      href: '/#faq',
    },
    {
      icon: Mail,
      title: 'Contact Support',
      description: 'Get help from our team',
      href: '/contact',
    },
  ];

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-button hover:scale-105 transition-transform p-0"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>How can we help?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {helpItems.map((item) => {
              const content = (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                      {item.action && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );

              if (item.action) {
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      item.action();
                      setOpen(false);
                    }}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.title}
                  to={item.href!}
                  onClick={() => setOpen(false)}
                  className="block"
                >
                  {content}
                </Link>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground pt-2">
            Or email us directly at{' '}
            <a href="mailto:support@auditeasetechnologies.com" className="text-primary hover:underline">
              support@auditeasetechnologies.com
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
