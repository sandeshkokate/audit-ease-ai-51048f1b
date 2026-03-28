import { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, X } from 'lucide-react';

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-56 rounded-xl border border-border bg-card shadow-lg p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">Need help?</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
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
